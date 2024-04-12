const memberServices = require("../services/member.services");

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

exports.addMember = async(req, res, next) =>{
    const userId = req.userId;
    const conversationId = req.params.conversationId;
    const newMemberIds = req.body.newMemberIds;
    await memberServices.addMember(userId, conversationId, newMemberIds);
    

}
