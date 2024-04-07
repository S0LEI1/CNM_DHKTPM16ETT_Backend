const GroupChat = require("../models/group_chat");
const groupChatServices = {
//   createSingleChat: async (conversationId, receiverId) => {
//     const groupChat = new GroupChat({
//       conversationId: conversationId,
//       receiverId: receiverId,
//     });
//     await groupChat.save();
//     return groupChat;
//   },
  removeMessage: async (chatId,messageId) => {
    try {
      return await GroupChat.findOneAndUpdate(
        { _id: chatId },
        { $pull: { messages: messageId } },
        { safe: true, multi: false }
      );
    } catch (error) {
      throw error;
    }
  },
  updateMessages: async (chatId,message) =>{
    try {
      return await GroupChat.updateOne(
        { _id: chatId }, 
        { $push: { messages: message } })
    } catch (error) {
      
    }
  }
};
module.exports = groupChatServices;
