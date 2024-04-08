const mongoose = require("mongoose");
const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const SingleChat = require("../models/single_chat");
const GroupChat = require("../models/group_chat");
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
const { CREATE_CHAT, DELETE_CHAT } = require("../success");
const singChatServices = require("../services/single_chat.services");
const { avatar } = require("../utils/validate");
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
  const conversationId = req.body.conversationId;
  const receiverId = req.body.receiverId;
  const userId = req.userId;
  try {
    const conversation = await Conversation.findOne({ _id: conversationId });
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND_ERR });
    }
    const receiver = await User.findById(receiverId);
    if (!conversation) {
      const cons = await conversationServices.createConversation(
        user._id,
        receiver.name,
        receiver.avatar
      );
      const chat = await singleChatServices.createSingleChat(
        cons._id,
        receiver._id
      );
      return res.status(200).json({
        message: "Create singleConversation success",
        avatar: receiver.avatar,
        chatName: cons.chatName,
        chat,
      });
    } else if (conversation) {
      const conversation = await Conversation.findById(conversationId);
      var chat;
      if (conversation.type === "SINGLE") {
        chat = await SingleChat.findOne({ conversationId: conversationId })
          .populate("messages")
          .exec();
      } else if (conversation.type === "GROUP") {
        chat = await GroupChat.findOne({ conversationId: conversationId })
          .populate("messages")
          .exec();
      } else {
        return res.status(500).json({ message: "An error" });
      }
      return res.status(201).json({
        message: "Success",

        avatar: conversation.avatar,
        chatName: conversation.chatName,
        // messages,
        chat,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// exports.createSingleConversation = async (req, res, next) => {
//   try {
//     const userId = req.userId;
//     const user = await User.findById(userId);
//     const receiverId = req.params.receiverId;
//     const receiver = await User.findById(receiverId);
//     if (!receiver) {
//       return res.status(404).json({ message: "Receiver not found." });
//     }
//     const conversation = await conversationServices.createConversation(userId, receiver.name, receiver.avatar);
//     const singleChat = await singChatServices.createSingleChat(conversation._id, receiver._id);
//     if (!conversation) {
//       return res.status(500).json({ message: CON_ERR });
//     }
//     user.conversations.push(conversation);
//     await user.save();
//     receiver.conversations.push(conversation);
//     await receiver.save();
//     res.status(200).json({ message: CREATE_CHAT, conversation, singleChat });
//   } catch (error) {
//     if (!error.statusCode) {
//       error.statusCode = 500;
//     }
//     next(error);
//   }
// };

exports.deleteConversation = async (req, res, next) => {
  const userId = req.userId;
  const conversationId = req.params.conversationId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: USER_NOT_FOUND_ERR });
    }
    const cons = await Conversation.findById(conversationId);
    if (!cons) {
      return res.status(404).json({ message: CON_NOT_FOUND_ERR });
    }
    await userService.removeConversation(user._id, cons._id);
    await user.save();
    res.status(200).json({ message: DELETE_CHAT });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
