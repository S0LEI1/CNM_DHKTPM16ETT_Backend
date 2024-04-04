const Conversation = require("../models/conversation");
const Message = require("../models/message")
const conversationServices = {
  getConversations: async (user) => {
    try {
       const conversations =  await Conversation.find({
        _id: { $in: user.conversations },
      })
        .populate({
          path: "participants",
          match: { _id: { $ne: user._id } },
          select: "name avatar phoneNumber email",
        })
        .exec();
        return conversations;
    } catch (error) {
      throw error;
    }
  },
  createSingleConversation: async(user, receiver) =>{
    const conversation = new Conversation();
    conversation.userId= user._id;
    conversation.chatId = singleChat._id;
    conversation.chatName = receiver.name;
    conversation.avatar = receiver.avatar;
    await conversation.save();
    user.conversations.push(conversation._id);
    receiver.conversations.push(conversation._id);
    await user.save();
    await receiver.save();
    return conversation;
  }
};

module.exports = conversationServices;
