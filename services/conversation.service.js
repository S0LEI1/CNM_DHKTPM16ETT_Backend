const Conversation = require("../models/conversation");
const Member = require("../models/member");
const Message = require("../models/message");
const User = require("../models/user");
const messageServices = require("./message.services");
const singleConversationServices = require("./single.conversation.service");
const conversationServices = {
  
  getConversations: async (user) => {
    try {
      const conversations = await Conversation.find({
        _id: { $in: user.conversations },
      })
       
      return conversations;
    } catch (error) {
      throw error;
    }
  },
  createSingleConversation: async (userId1, userId2) => {
    try {
      const user1 = await User.findById(userId1);
      const user2 = await User.findById(userId2);
      const existConversation = await Conversation.findOne({
        type: "SINGLE",
        members: { $all: [userId1, userId2] },
      });
      if (existConversation) {
        return existConversation;
      }
      const conversation = new Conversation({
        members: [user1, user2],
        type: "SINGLE",
        // chatName: user2.name,
      });
      await conversation.save();
      const { _id } = conversation;
      const members1 = new Member({
        conversationId: _id,
        userId: userId1,
      });
      const members2 = new Member({
        conversationId: _id,
        userId: userId2,
      });
      await members1.save();
      await members2.save();
      return conversation;
    } catch (error) {
      throw error;
    }
  },
  updateLastMessage: async (conversationId, message) => {
    try {
      Conversation.updateOne(
        { _id: conversationId },
        { $set: { lastMessages: message } },
        { upsert: true }
      );
    } catch (error) {
      throw error;
    }
  },
  createConversationWhenAddFriend: async (userId, chatName, avatar) => {
    try {
      const conversation = new Conversation({
        userId: userId,
        chatName: chatName,
        // avatar: avatar,
        type: "SINGLE",
      });
      await conversation.save();
      return conversation;
    } catch (error) {
      throw error;
    }
  },
  getSummaryConversation: async (conversationId, userId) => {
    try {
      const member = await Member.getByConversationIdAndUserId(conversationId, userId);
      const conversation = await Conversation.findById(conversationId);
      const lastMessageId = conversation.lastMessages;
      const lastMessage = lastMessageId
        ? await Message.findById(lastMessageId,{content:1})
        : null;
      let nameAndAvatar;
      if (conversation.type === "SINGLE") {
        nameAndAvatar = await singleConversationServices.getSingleConversation(conversationId, userId);
      }else if(conversation.type ==="GROUP"){
        nameAndAvatar = "";
      }
      return {conversationId, ...nameAndAvatar, lastMessage}
    } catch (error) {
      throw error;
    }
  },
  getConversation: async (consId, userId) => {
    try {
      const member = await Member.getByConversationIdAndUserId(consId, userId);
      const conversation = await Conversation.findById(consId);
      // const lastMessageId = conversation.lastMessages;
      // const lastMessage = lastMessageId
      //   ? await Message.findById(lastMessageId)
      //   : null;
      let nameAndAvatar;
      if (conversation.type === "SINGLE") {
        nameAndAvatar = await singleConversationServices.getSingleConversation(consId, userId);
      }else if(conversation.type ==="GROUP"){
        nameAndAvatar = "";
      }
      const messages = await messageServices.getMessages(consId, true);
      return {conversation, nameAndAvatar, messages}
    } catch (error) {
      throw error;
    }
  },

};

module.exports = conversationServices;
