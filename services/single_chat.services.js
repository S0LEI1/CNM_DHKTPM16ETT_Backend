const SingleChat = require("../models/single_chat");
const singleChatServices = {
 createSingleChat: async (conversationId, receiverId) => {
    const singleChat = new SingleChat({
      conversationId: conversationId,
      receiverId: receiverId,
    });
    await singleChat.save();
    return singleChat;
  },
  removeMessage: async (chatId,messageId) => {
    try {
      return await SingleChat.findOneAndUpdate(
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
      return await SingleChat.updateOne(
        { _id: chatId }, 
        { $push: { messages: message } })
    } catch (error) {
      throw error;
    }
  }
};
module.exports = singleChatServices;
