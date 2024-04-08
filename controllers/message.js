const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const io = require("../socket");

const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const SingleChat = require("../models/single_chat");
const GroupChat = require("../models/group_chat");
const {
  SINGLE_CHAT_ERR,
  USER_NOT_FOUND_ERR,
  CON_NOT_FOUND_ERR,
} = require("../errors");
const messageServices = require("../services/message.services");
const validate = require("../utils/validate");
const { uploadFile } = require("../services/upload_file");
const singleChatServices = require("../services/single_chat.services");
const groupChatServices = require("../services/group_chat.services");
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
    const singleChat = await SingleChat.findOne({
      conversationId: conversation._id,
    });
    const groupChat = await GroupChat.findOne({
      conversationId: conversation._id,
    });
    if (!singleChat && !groupChat) {
      return res.status(404).json({ message: SINGLE_CHAT_ERR });
    }
    var message;
    if (files) {
      var fileUrls =  [];
      console.log(files);
      const folderName = user._id;
      // const fileUrl = await messageServices.uploadFile(folderName, file);
      for (let index = 0; index < files.length; index++) {
        const url = await messageServices.uploadFile(folderName, files[index]);
        fileUrls.push(url);
        console.log(url);
      }
      message = new Message({
        senderId: senderId,
        senderName: user.name,
        content: content,
        fileUrl: fileUrls,
        type: "TEXTANDFILE",
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
      });
    }
    await message.save();
    if (singleChat) {
      await singleChatServices.updateMessages(singleChat._id, message);
    } else {
      await groupChatServices.updateMessages(groupChat._id, message);
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
    const fileUrl = await messageServices.fileMessage(folderName, file);
    const message = new Message({
      senderId: senderId,
      senderName: user.name,
      //   view: view,
      content: fileUrl,
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
    // conversation.lastMessages = message._id;
    // await conversation.save();
    await conversationServices.updateLastMessage(conversation._id, message);
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
exports.deleteMessage = async (req, res, next) => {
  const messageId = req.params.messageId;
  const chatId = req.body.chatId;
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    await message.deleteOne();
    const singChat = await SingleChat.findById(chatId);
    const groupChat = await GroupChat.findById(chatId);
    if(!singChat && !groupChat)
      return res.status(404).json({message:CON_NOT_FOUND_ERR});

    if (singChat) {
      await singleChatServices.removeMessage(chatId, message._id);
      await singChat.save();
      return res
        .status(200)
        .json({ message: "Delete success", message, singChat });
    } else if (groupChat) {
      await groupChatServices.removeMessage(chatId, message._id);
      await groupChat.save();
      return res
        .status(200)
        .json({ message: "Delete success", message, groupChat });
    } else {
      return res.status(500).json({ message: "Type not valid" });
    }
  } catch (error) {}
};
