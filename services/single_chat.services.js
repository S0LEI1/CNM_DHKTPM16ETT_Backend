const SingleChat = require("../models/single_chat");
const singleChatServices = {
  createSingleChat: async (receiver) => {
    const singleChat = new SingleChat();
    const messages = [];
    singleChat.receriverId = receiver._id;
    singleChat.messages = messages;
    await singleChat.save();
    return singleChat;
  },
};
module.exports = singleChatServices;
