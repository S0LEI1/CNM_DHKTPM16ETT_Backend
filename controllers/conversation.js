const mongoose = require("mongoose");
const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const {
  USER_NOT_FOUND_ERR,
  CON_NOT_FOUND_ERR,
  MGS_NOT_FOUND_ERR,
} = require("../errors");
const conversationServices = require("../services/conversation.service");
const userService = require("../services/user.services");
const messageServices = require("../services/message.services");

exports.getConversations = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND_ERR });
    }
    const conversations = await conversationServices.getConversations(user);
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
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: CON_NOT_FOUND_ERR });
  }
  const messages = await messageServices.getMessages(conversation.messages);
  const userMessages = [];
  const friendMessages = [];
  for (let index = 0; index < messages.length; index++) {
    if (messages[index].senderId.toString() === userId.toString()) {
      userMessages.push(messages[index]);
    } else friendMessages.push(messages[index]);
  }
  if (!messages) {
    return res.status(200).json({ message: MGS_NOT_FOUND_ERR });
  }
  res.status(201).json({
    message: "Success",
    userId: userId,
    userMessages: userMessages,
    friendMessages: friendMessages,
  });
};

exports.createSingleConversation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const receiverId = req.params.receiverId;
    const messages = [];
    const user = await User.findById(userId);
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found." });
    }
    const singleCons = new Conversation({
      participants: [userId, receiverId],
      messages: messages,
    });
    await singleCons.save();
    user.conversations.push(singleCons);
    receiver.conversations.push(singleCons);
    await user.save();
    await receiver.save();
    res.status(201).json({
      message: "Creaate single conversation success .",
      conversationId: singleCons.id,
    });
  } catch (error) {
    console.log(error);
  }
};
