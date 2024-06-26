const Conversation = require("../models/conversation");
const Member = require("../models/member");
const userValidate = require("./userValidate");
const memberValidate = {
  validateAddMember: async (userId, conversationId, newMemberIds) => {
    if (newMemberIds.length <= 0) throw new Error("User must >0");
    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [userId] },
    });
    console.log(conversation);
    if (conversation.type === "SINGLE")
      throw new Error("Can not add member, only group");
    await userValidate.checkListUser(newMemberIds);
    const isExistMember = await Conversation.findOne({
      _id: conversationId,
      members: { $in: newMemberIds },
    });
    if (isExistMember) throw new Error("Member exist in group");
  },
  validateDeleteMember: async (conversationId, userId, deleteUserId) => {
    if (userId === deleteUserId) throw new Error("Not delete your");
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (conversation.type === "SINGLE")
      throw new Error("Can not delete member, only group");
    console.log(conversation.leaderId);
    console.log(userId);
    if(conversation.leaderId.toString() !== userId)
      throw new Error("Only leader delete member");
    const isExistMember = await Member.findOne({
      conversationId: conversationId,
      userid: deleteUserId,
    });
    if(isExistMember) throw new Error("Member not exist in group");
  },
  validateLeaveGroup: async(conversationId, userId) =>{
    const conversation = await Conversation.findOne({_id: conversationId, members:{$in: [userId]}});
    if(!conversation) throw new Error("Conversation not found");
    if(conversation.type ==="SINGLE" || conversation.leaderId.toString() === userId){
      throw new Error("Leader can not leave group")
    }
  },
  validateMember: async(conversationId, friend) =>{
    const _id = friend._id;
    const name = friend.name;
    const avatar = friend.avatar;
    const member = await Member.findOne({
      conversationId: conversationId,
      userId: _id
    })
    if(!member) 
      return {_id,name,avatar, isExistInGroup: false}
    return {_id,name,avatar, isExistInGroup: true};
  }
};

module.exports = memberValidate;
