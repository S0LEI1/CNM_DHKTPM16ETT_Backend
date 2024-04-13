const Member = require("../models/member");
const memberValidate = require("../validate/memberValidate");
const ObjectId = require("mongoose").Types.ObjectId;
const Conversation = require("../models/conversation");
const NotFoundError = require("../exception/NotFoundErr");
const MyError = require("../exception/MyError");
const memberServices = {
  createMember: async (conversationId, userId) => {
    const member = new Member({
      userId: userId,
      conversationId: conversationId,
    });
    await member.save();
    return member;
  },
  getByConversationIdAndUserId: async (conversationId, userId) => {
    const member = await Member.findOne({
      conversationId: conversationId,
      userId: userId,
    });
    return member;
  },
  getListMemberByConversationId: async (conversationId) => {
    const users = await Member.aggregate([
      { $match: { conversationId: new ObjectId(conversationId) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          user: {
            _id: 1,
            name: 1,
            avatar: 1,
          },
        },
      },
      {
        $replaceWith: "$user",
      },
    ]);
    return users;
  },
  addMember: async (userId, conversationId, newMemberIds) => {
    await memberValidate.validateAddMember(
      userId,
      conversationId,
      newMemberIds
    );
    await Conversation.updateOne(
      { _id: conversationId },
      { $push: { members: newMemberIds } }
    );
    for (let index = 0; index < newMemberIds.length; index++) {
      const member = new Member({
        conversationId: conversationId,
        userId: newMemberIds[index],
      });
      await member.save();
    }
  },
  deleteMember: async (conversationId, userId, deleteUserId) => {
    await memberValidate.validateDeleteMember(
      conversationId,
      userId,
      deleteUserId
    );
    const conversation = await Conversation.updateOne(
      { _id: conversationId },
      { $pull: { members: deleteUserId } }
    );
    await Member.deleteOne({
      conversationId: conversationId,
      userId: deleteUserId,
    });
    return conversation;
  },
  leaveGroup: async (conversationId, userId) => {
    await memberValidate.validateLeaveGroup(conversationId, userId);
    const conversation = await Conversation.updateOne(
      { _id: conversationId },
      { $pull: { members: userId } }
    );
    await Member.deleteOne({ conversationId: conversationId, userId: userId });
    return conversation;
  },
  updateLeader: async (conversationId, userId, newLeaderId) => {
    const conversation = await Conversation.find({
      _id: conversationId,
      members: { $in: [userId] },
    });
    if(!conversation) throw new NotFoundError("Conversation");
    if(userId === newLeaderId) throw new MyError("You are leader");
    const member = await Member.findOne({conversationId: conversationId, userId: newLeaderId});

    if(!member) throw new MyError("Member not in group");
    await Conversation.updateOne(
      {_id: conversationId},
      {leaderId: newLeaderId}
    )
    return conversation;
  },
};

module.exports = memberServices;
