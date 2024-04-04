const Conversation = require("../models/conversation");
const Message = require("../models/message")
const conversationServices = {
  getConversations: async (user) => {
    try {
       const conversations =  await Conversation.find({
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
};

module.exports = conversationServices;
