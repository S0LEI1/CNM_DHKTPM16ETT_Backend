const memberServices = require("../services/member.services");
const io = require("../socket");

exports.getList = async (req, res, next) => {
  const userId = req.userId;
  const conversationId = req.params.conversationId;
  console.log(conversationId);
  try {
    const member = await memberServices.getByConversationIdAndUserId(
      conversationId,
      userId
    );
    if (!member)
      return res.status(404).json({ message: "Conversation not found" });
    const users = await memberServices.getListMemberByConversationId(
      conversationId
    );
    res.status(200).json({ users });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  const userId = req.userId;
  const conversationId = req.params.conversationId;
  const newMemberIds = req.body.newMemberIds;
  try {
    await memberServices.addMember(userId, conversationId, newMemberIds);
    for (let index = 0; index < newMemberIds.length; index++) {
      io.getIO().emit("add-group", conversationId, {
        action: "create",
      });
    }
    io.getIO().emit("update-member", conversationId, {
      action: "update",
    });
    res.status(200).json({ message: "Add member success" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};
exports.deleteMember = async(req, res, next) =>{
  const userId = req.userId;
  const conversationId = req.params.conversationId;
  const deleteUserId = req.body.deleteUserId;
  try {
    const conversation = await memberServices.deleteMember(conversationId, userId, deleteUserId);
    if(!conversation){
      return res.status(404).json({message:"Conversation not found"})
    }
    io.getIO().emit("update-member", conversationId, {
      action: "update",
    });
    io.getIO().emit("delete-group", conversationId, {
      action: "delete",
    });
    res.status(200).json({message:"Delete member success"})
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
}
exports.leaveGroup = async(req, res, next) =>{
  const userId = req.userId;
  const conversationId = req.params.conversationId;
  try {
    const conversation = await memberServices.leaveGroup(conversationId, userId);
    io.getIO().emit("update-member", conversationId, {
      action: "update",
    });
    res.status(200).json();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
}