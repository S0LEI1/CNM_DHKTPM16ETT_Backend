const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const io = require("../socket");

const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const SingleChat = require("../models/single_chat");
const { SINGLE_CHAT_ERR } = require("../errors");

exports.createMessage = async (req, res, next) => {
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
    if(!singleChat){
      return res.status(404).json({message:SINGLE_CHAT_ERR});
    }
    const message = new Message({
      senderId: senderId,
      senderName: user.name,
      //   view: view,
      content: content,
    });
    await message.save();
    singleChat.messages.push(message);
    await singleChat.save();
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
