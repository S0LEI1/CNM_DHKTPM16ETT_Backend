const mongoose = require("mongoose");
const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const io = require("../socket");
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
// const singChatServices = require("../services/single_chat.services");
const { avatar } = require("../utils/validate");
const memberServices = require("../services/member.services");
const NotFoundError = require("../exception/NotFoundErr");

exports.getListConversation = async (req, res, next) => {
  const userId = req.userId;
  try {
    const conversation = await Conversation.find({
      members: { $in: [userId] },
    });
    const conversationIds = conversation.map((cons) => cons._id);
    console.log(conversationIds);
    const conversations = [];
    for (let index = 0; index < conversationIds.length; index++) {
      const cons = await conversationServices.getSummaryConversation(
        conversationIds[index],
        userId
      );
      conversations.push(cons);
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
  const userId = req.userId;
  // const user = await User.findById(userId);
  try {
    const { conversation, nameAndAvatar, messages } =
      await conversationServices.getConversation(conversationId, userId);
    if (!conversation) {
      return res.status(404).json({ message: CON_NOT_FOUND_ERR });
    }
    res.status(200).json({
      message: "Success",
      conversation,
      nameAndAvatar,
      messages,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createSingleConversation = async (req, res, next) => {
  const userId = req.userId;
  const receiverId = req.params.receiverId;
  console.log(receiverId);
  try {
    const user = await User.findById(userId);
    const receiver = await User.findById(receiverId);

    console.log("receiver",receiver);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found." });
    }
    const conversation = await conversationServices.createSingleConversation(
      userId,
      receiverId
    );
    const cons = await conversationServices.getSummaryConversation(
      conversation._id,
      userId
    );
    console.log(cons);
    io.getIO().emit("create-conversation", {
      action: "create",
      conversation: {
        ...cons._doc,
        creator: { _id: userId },
      },
    });
    io.getIO().emit("create-conversation", {
      action: "create",
      conversation: {
        ...cons._doc,
        creator: { _id: receiverId },
      },
    });
    res.status(201).json({ message: CREATE_CHAT, conversation: cons });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
exports.createGroupConversation = async (req, res, next) => {
  const userId = req.userId;
  const chatName = req.body.chatName;
  const memberIds = req.body.memberIds;
  const image = req.file;
  try {
    const groupCons = await conversationServices.createGroupConversation(
      userId,
      chatName,
      memberIds,
      image
    );
    const groupUserId = [userId, ...memberIds];
    for (let index = 0; index < groupUserId.length; index++) {
      io.getIO().emit("create-group-conversation", {
        action: "create",
        group: {
          ...groupCons._doc,
          member: { _id: groupUserId[index] },
        },
      });
    }
    res.status(201).json({ groupCons });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteAllMessage = async(req, res, next) =>{
  const userId = req.userId;
  const conversationId = req.params.conversationId;
  try {
    await messageServices.deleteAllMessage(conversationId, userId);
    res.status(200).json("Delete all message success")
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}

exports.deleteGroupConversation = async(req, res, next) =>{
  const userId = req.userId;
  const conversationId = req.params.conversationId;
  try {
    await conversationServices.deleteGroupConversation(conversationId, userId);
    res.status(200).json("Delete conversation success")
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  } 
}
exports.updateGroupName = async(req, res, next) =>{
  const userId = req.userId;
  const conversationId = req.params.conversationId;
  const name = req.body.name;
  try {
    if(!name) throw new NotFoundError("Name ");
    const conversation = await conversationServices.updateGroupName(conversationId, userId, name);
    io.getIO().emit("update-group-name", {
      action: "update",
      conversationId
    });
    res.status(200).json({message:"Update name success", conversation});
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}

