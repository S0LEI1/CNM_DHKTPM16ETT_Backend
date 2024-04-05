const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const io = require("../socket");

const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const SingleChat = require("../models/single_chat");
const GroupChat = require("../models/group_chat");
const { SINGLE_CHAT_ERR } = require("../errors");
const messageServices = require("../services/message.services");
const validate = require("../utils/validate");
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
    const singleChat = await SingleChat.findById(conversation.chatId);
    const groupChat = await GroupChat.findById(conversation.chatId);
    if (!singleChat && !groupChat) {
      return res.status(404).json({ message: SINGLE_CHAT_ERR });
    }
    const message = new Message({
      senderId: senderId,
      senderName: user.name,
      //   view: view,
      content: content,
    });
    await message.save();
    if (singleChat) {
      singleChat.messages.push(message);
      await singleChat.save();
    } else {
      groupChat.messages.push(message);
      await groupChat.save();
    }
    conversation.lastMessages = message._id;
    await conversation.save();
    io.getIO().emit("message", {
      action: "create",
      message: {
        ...message._doc,
        creator: { _id: senderId, name: user.senderName },
      },
    });
    res.status(201).json({
      message: "Create message success!",
      message: message,
      singleChatId: singleChat._id,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createFileMessage = async (req, res, next) => {
  const conversationId = req.params.conversationId;
  const senderId = req.userId;
  //   const receiverId = req.params.receiverId;
  const file = req.file;
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
    const singleChat = await SingleChat.findById(conversation.chatId);
    const groupChat = await GroupChat.findById(conversation.chatId);
    if (!singleChat && !groupChat) {
      return res.status(404).json({ message: SINGLE_CHAT_ERR });
    }
    if (!file) {
      return res.status(500).json({ message: "No file" });
    }
    const error = validate.file(file);
    if (error) {
      return res.status(500).json({ message: "Validate fail", error: error });
    }
    const folderName = user._id;
    const fileImage = await messageServices.fileMessage(folderName, file);
    const message = new Message({
      senderId: senderId,
      senderName: user.name,
      //   view: view,
      content: fileImage,
      type: "FILE",
    });
    await message.save();
    if (singleChat) {
      singleChat.messages.push(message);
      await singleChat.save();
    } else {
      groupChat.messages.push(message);
      await groupChat.save();
    }
    conversation.lastMessages = message._id;
    await conversation.save();
    io.getIO().emit("message", {
      action: "create",
      message: {
        ...message._doc,
        creator: { _id: senderId, name: user.senderName },
      },
    });
    res.status(201).json({
      message: "Create message success!",
      message: message,
      singleChatId: singleChat._id,
    });
  } catch (error) {
    console.log(error);
  }
};
