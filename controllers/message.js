const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const io = require("../socket");

const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

const {
  SINGLE_CHAT_ERR,
  USER_NOT_FOUND_ERR,
  CON_NOT_FOUND_ERR,
} = require("../errors");
const messageServices = require("../services/message.services");
const validate = require("../utils/validate");
const { uploadFile } = require("../services/upload_file");

const conversationServices = require("../services/conversation.service");
const type = {
  USERS: "users",
  CONVERSATIONS: "conversations",
};
const fileType = {
  IMAGE: "image",
  FILE: "file",
};
exports.createTextMessage = async (req, res, next) => {
  const conversationId = req.params.conversationId;
  const senderId = req.userId;
  //   const receiverId = req.params.receiverId;
  const content = req.body.content;
  const files = req.files;
  try {
    const user = await User.findById(senderId);
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }
    var message;
    if (files) {
      const folderName = user._id;
      const fileUrls = [];
      for (let index = 0; index < files.length; index++) {
        const error = validate.file(files[index]);
        if (error) {
          return res
            .status(500)
            .json({ message: "Validate fail", error: error });
        }
        const url = await messageServices.uploadFile(folderName, files[index]);
        fileUrls.push(url);
      }
      message = new Message({
        senderId: senderId,
        senderName: user.name,
        senderAvatar: user.avatar,
        content: content,
        fileUrls: fileUrls,
        type: "TEXTANDFILE",
        conversationId: conversationId,
      });
    } else {
      const errors = validate.content(content);
      if (errors) {
        return res
          .status(500)
          .json({ message: "Validate error", errors: errors });
      }
      message = new Message({
        senderId: senderId,
        senderName: user.name,
        senderAvatar: user.avatar,
        content: content,
        conversationId: conversationId,
        
      });
    }
    await message.save();
    conversation.lastMessages = message._id;
    await conversation.save();
    io.getIO().emit("message", {
      action: "create",
      message: {
        ...message._doc,
        creator: { _id: senderId, name: user.name },
        conversationId,
      },
    });
    res.status(201).json({
      message: "Create message success!",
      message: message,
      conversation,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.createFileMessage = async (req, res, next) => {
  const conversationId = req.params.conversationId;
  const senderId = req.userId;
  const files = req.files;
  const user = await User.findById(senderId);
  
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }
    if (!files) {
      return res.status(500).json({ message: "No file" });
    }
    const folderName = user._id;
    const fileUrls = [];
    for (let index = 0; index < files.length; index++) {
      const error = validate.file(files[index]);
      if (error) {
        return res.status(500).json({ message: "Validate fail", error: error });
      }
      const url = await messageServices.uploadFile(folderName, files[index]);
      fileUrls.push(url);
    }
    const message = new Message({
      senderId: senderId,
      senderName: user.name,
      senderAvatar: user.avatar,
      //   view: view,
      fileUrls: fileUrls,
      type: "FILE",
      conversationId: conversationId,
    });
    await message.save();
    await conversationServices.updateLastMessage(conversation._id, message);
    io.getIO().emit("message", {
      action: "create",
      message: {
        ...message._doc,
        creator: { _id: senderId, name: user.senderName },
        conversationId,
        // message
      },
    });
    res.status(201).json({
      message: "Create message success!",
      message: message,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};
exports.deleteMessage = async (req, res, next) => {
  const messageId = req.params.messageId;
  const userId = req.userId;
  try {
    const { conversationId } =
      await messageServices.deleteMessageById(userId, messageId);
      io.getIO().emit("message", {
        action: "delete",
        conversationId
      });
      res.status(200).json({message:"Delete success"})
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.deleteOnlyByMe = async(req, res, next) =>{
  const userId = req.userId;
  const messageId = req.params.messageId;
  try {
    await messageServices.deleteOnlyByMe(userId, messageId);
    res.status(200).json({message:"Successful recall"});
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
}
exports.shareMessage = async(req, res, next) =>{
  const messageId = req.params.messageId;
  const conversationId = req.params.conversationId;
  const userId = req.userId;
  try {
    const shareMessage = await messageServices.shareMessage(conversationId, messageId, userId);
    io.getIO().emit("share-message", {
      action: "create",
      conversationId
    });
    res.status(200).json({message:"Delete success"})
    res.status(200).json({shareMessage});
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
}