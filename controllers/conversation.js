const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

exports.getConversations = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const conversations = await Conversation.find({
      _id: { $in: user.conversations },
    })
      .populate("participants")
      .exec();
    if (conversations.length <= 0) {
      return res.status(404).json({ message: "Conversations not found" });
    }
    res.status(200).json({ conversations: conversations });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getConversation = async (req, res, next) => {
  const conversationId = req.params.conversationId;
  // const userId = req.userId;
  // const user = await User.findById(userId);
  const conversations = await Conversation.findById(conversationId);
  // sai
  const messages = await Message.find({ _id: conversations.messages });

  res.status(201).json({
    message: "Success",
    conversations: conversations,
    messages: messages,
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
