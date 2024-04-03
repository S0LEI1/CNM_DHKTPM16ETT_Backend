const Conversation = require("../models/conversation");
const conversationServices = {
  getConversations: async (user) => {
    try {
      return await Conversation.find({
        _id: { $in: user.conversations },
      })
        .populate({
          path: "participants",
          match: { _id: { $ne: user._id } },
          select: "name avatar phoneNumber email",
        })
        .populate({
          path: "messages",
          options: { limit: 1, sort: { createdAt: -1 } },
          select: "content",
        })
        .exec();
    } catch (error) {
      throw error;
    }
  },
};

module.exports = conversationServices;
