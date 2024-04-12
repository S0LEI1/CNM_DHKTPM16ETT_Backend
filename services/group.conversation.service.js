const Conversation = require("../models/conversation");
const ObjectId = require("mongoose").Types.ObjectId;
const groupConversationServices = {
  getNameAndAvatar: async (conversation) => {
    const conversationId = conversation._id;
    const name = conversation.chatName;
    const avatar = conversation.avatar;
    const result = {
      name,
      avatar,
    };

    return result;
  },
  getGroupConversation: async (conversationId) => {
    return await Conversation.aggregate([
      { $match: { _id: new ObjectId(conversationId) } },
      {
        $project: {
          _id: 0,
          members: 1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          avatar: "$user.avatar",
        },
      },
    ]);
  },
};

module.exports = groupConversationServices;
