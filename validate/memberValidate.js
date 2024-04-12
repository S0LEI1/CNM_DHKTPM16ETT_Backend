const Conversation = require("../models/conversation");
const userValidate = require("./userValidate");
const memberValidate = {
  validateAddMember: async (userId, conversationId, newMemberIds) => {
    if (newMemberIds.length <= 0) throw new Error("User must >0");
    const conversation = await Conversation.findOne({
      _id,
      members: { $in: [userId] },
    });
    const { type } = conversation;
    if (type === "SINGLE") throw new Error("Can not add member, only group");
    await userValidate.checkListUser(newMemberIds);
    const isExistMember = await Conversation.findOne({
      _id: conversationId,
      members: { $in: newMemberIds },
    });
    if(isExistMember) throw new Error("Member exist in group");
  },
};

module.exports = memberValidate;
