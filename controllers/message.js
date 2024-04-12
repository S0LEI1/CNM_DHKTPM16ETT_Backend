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
        content: content,
        fileUrls: fileUrls,
        type: "TEXTANDFILE",
        conversationId: conversationId
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
        //   view: view,
        content: content,
        conversationId: conversationId,
        // view:{
        //     in
        // }
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
        // message
      },
    });
    res.status(201).json({
      message: "Create message success!",
      message: message,
      conversation,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createFileMessage = async (req, res, next) => {
  const conversationId = req.params.conversationId;
  const senderId = req.userId;
  //   const receiverId = req.params.receiverId;
  const files = req.files;
  const user = await User.findById(senderId);
  //   const view = {
  //     inbox: false,
  //     outbox: true,
  //     archive: false,
  //   };
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
    console.log(error);
  }
};
exports.deleteMessage = async (req, res, next) => {
  const messageId = req.params.messageId;
  const conversationId = req.body.conversationId;
  const userId = req.userId;
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    if(message.senderId != userId){
        return res.status(500).json({})
    }else{
        message.deleteOne();
        return io.getIO().emit("delete-message", {
            action: "delete",
            message: {
              ...message._doc,
              conversationId,
              // message
            },
          });
    }
  } catch (error) {}
};
