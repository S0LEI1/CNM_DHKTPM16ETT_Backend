const Conversation = require("../models/conversation");
const Member = require("../models/member");
const Message = require("../models/message");
const User = require("../models/user");
const conversationServices = {
  getConversations: async (user) => {
    try {
      const conversations = await Conversation.find({
        _id: { $in: user.conversations },
      })
        .populate({
          path: "participants",
          match: { _id: { $ne: user._id } },
          select: "name avatar phoneNumber email",
        })
        .exec();
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
      if(existConversation){
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
};

module.exports = conversationServices;
