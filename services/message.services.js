const Message = require("../models/message");

const messageServices = {
  getMessages: async (messagesId, userId) => {
    const messages = await Message.find(
      { _id: messagesId },
      { _id: 1, content: 1, senderId: 1, senderName: 1 }
    );
    const userMessages = [];
    const friendMessages = [];
    for (let index = 0; index < messages.length; index++) {
      if (messages[index].senderId.toString() === userId.toString()) {
        userMessages.push(messages[index]);
      } else friendMessages.push(messages[index]);
    }
    return {userMessages, friendMessages};
  },
};
module.exports = messageServices;
