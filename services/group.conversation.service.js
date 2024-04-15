const NotFoundError = require("../exception/NotFoundErr");
const MyError = require("../exception/MyError");
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
  addDeputyLeader: async (conversationId, userId, deputyLeaderId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [userId] },
    });

    if (!conversation) throw new NotFoundError("Conversation");
    if (conversation.type === "SINGLE") throw new MyError("Only group");
    if (conversation.leaderId.toString() != userId)
      throw new MyError("Only leader can add deputy leader");
    if (userId === deputyLeaderId) throw new MyError("You are already leader");
    const isExist = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [deputyLeaderId] },
    });
    if (!isExist) throw new MyError("Member not exist in group");
    const isExistDeputyLeader = await Conversation.findOne({_id: conversationId, deputyLeaderId:{$in:[deputyLeaderId]}});
    if(isExistDeputyLeader) throw new MyError("The selected member was the group's deputy leader");
    const updateConversation = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      { $push: { deputyLeaderId: deputyLeaderId } },
      { new: true }
    );
    return updateConversation;
  },
  deleteDeputyLeader: async (conversationId, userId, deputyLeaderId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [userId] },
    });

    if (!conversation) throw new NotFoundError("Conversation");
    if (conversation.type === "SINGLE") throw new MyError("Only group");
    if (conversation.leaderId.toString() != userId)
      throw new MyError("Only leader can add deputy leader");
    const isExist = await Conversation.findOne({
      _id: conversationId,
      deputyLeaderId: { $in: [deputyLeaderId] },
    });
    if (!isExist) throw new MyError("Member not deputy leader");
    const updateConversation = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      { $pull: { deputyLeaderId: deputyLeaderId } },
      { new: true }
    );
    return updateConversation;
  },
};

module.exports = groupConversationServices;
