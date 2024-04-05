const mongoose = require("mongoose");
const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const SingleChat = require("../models/single_chat");
const {
  USER_NOT_FOUND_ERR,
  CON_NOT_FOUND_ERR,
  MGS_NOT_FOUND_ERR,
  RECEIVER_NOT_FOUND_ERR,
  CON_ERR,
  SINGLE_CHAT_ERR,
} = require("../errors");
const conversationServices = require("../services/conversation.service");
const userService = require("../services/user.services");
const messageServices = require("../services/message.services");
const { CREATE_CHAT } = require("../success");
const singleChatServices = require("../services/single_chat.services");

exports.getConversations = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND_ERR });
    }
    const conversations = await Conversation.find({
      _id: { $in: user.conversations },
    });
    if (!conversations) {
      return res.status(404).json({ message: CON_NOT_FOUND_ERR });
    }
    res.status(200).json({ conversations: conversations, user: user });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getConversation = async (req, res, next) => {
  const conversationId = req.params.conversationId;
  const userId = req.userId;
  // const user = await User.findById(userId);
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: CON_NOT_FOUND_ERR });
    }
    const singleChat = await SingleChat.findById(conversation.chatId);

    const messages = await messageServices.getMessages(
      singleChat.messages,
      userId
    );

    if (!messages) {
      return res.status(200).json({ message: MGS_NOT_FOUND_ERR });
    }
    res.status(201).json({
      message: "Success",
      messages
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createSingleConversation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const receiverId = req.params.receiverId;
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found." });
    }
    const singleChat = await singleChatServices.createSingleChat(receiver);
    if (!singleChat) {
      return res.staus(500).json({ message: SINGLE_CHAT_ERR });
    }
    const conversation = await conversationServices.createSingleConversation(
      user,
      receiver
    );
    if (!conversation) {
      return res.status(500).json({ message: CON_ERR });
    }
    res.status(200).json({ message: CREATE_CHAT, conversation });
  } catch (error) {
    console.log(error);
  }
};
