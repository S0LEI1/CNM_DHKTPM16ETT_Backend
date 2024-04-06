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
};
module.exports = singleChatServices;
