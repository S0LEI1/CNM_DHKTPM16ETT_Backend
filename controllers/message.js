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
const NotFoundError = require("../exception/NotFoundErr");
const type = {
  USERS: "users",
  CONVERSATIONS: "conversations",
};
const fileType = {
  IMAGE: "image",
  FILE: "file",
};
exports.createMessage = async (req, res, next) => {
  const conversationId = req.params.conversationId;
  const senderId = req.userId;
  //   const receiverId = req.params.receiverId;
  const content = req.body.content;
  const files = req.files;
  
  try {
    const user = await User.findById(senderId);
    const conversation = await conversationServices.getConversationByIdAndUserId(conversationId, senderId)
    var message;
    if (files) {
      message = await messageServices.createFileMessage(conversationId, user, content, files);
    } else {
      message= await messageServices.createTextMessage(conversationId, user, content);
    }
    await message.save();
    // conversation.lastMessages = message._id;
    // await conversation.save();
    io.getIO().emit("message", {
      action: "create",
      // message: {
      //   ...message._doc,
      //   creator: { _id: senderId, name: user.name },
      //   conversationId,
      // },
      message: message,
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
  console.log(files);
  const user = await User.findById(senderId);
  try {
    await conversationServices.getConversationByIdAndUserId(conversationId, senderId);
    const message = await messageServices.createFileMessage(conversationId, user,"", files);

    io.getIO().emit("message", {
      action: "create",
      message: message,
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
     const {deleteMessage, conversationId} = await messageServices.deleteMessageById(userId, messageId);
      io.getIO().emit("message", {
        action: "delete",
        conversationId
      });
      res.status(200).json({message:"Delete success", deleteMessage})
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
    res.status(200).json({shareMessage});
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
}

exports.getMessageByConversationId = async(req, res, next) =>{
  const userId = req.userId;
  const conversationId = req.params.conversationId;
  const messages = await messageServices.getMessages(conversationId, userId);
  if(!messages){
    throw new NotFoundError("List message not found")
  }
  res.status(200).json({messages});
}