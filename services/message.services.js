const MyError = require("../exception/MyError");
const NotFoundError = require("../exception/NotFoundErr");
const Conversation = require("../models/conversation");
const Member = require("../models/member");
const Message = require("../models/message");
const messageValidate = require("../validate/messageValidate");
const User = require("../models/user");
const validate = require("../utils/validate");
const messageServices = {
  getMessages: async (consId, userId) => {
    const messages = await Message.find(
      {
        conversationId: consId,
        deletedUserIds: {
          $nin: [userId],
        },
      },
      {
        _id: 1,
        content: 1,
        senderId: 1,
        senderName: 1,
        senderAvatar: 1,
        fileUrls:1,
        createdAt: 1,
        updatedAt: 1,
        isDeleted: 1,
        deletedUserIds: 1,
      }
    ).sort({ createdAt: 1 });
    return messages;
  },

  deleteMessageById: async (userId, messageId) => {
    const message = await Message.findById(messageId);
    const conversationId = message.conversationId;
    if (!message) throw new Error("Message not found");
    if (message.senderId != userId)
      throw new Error("You not permission delete message");
    const deleteMessage = await Message.findOneAndUpdate(
      { _id: messageId },
      { isDeleted: true },
      { new: true }
    );

    return { deleteMessage, conversationId };
  },
  deleteOnlyByMe: async (userId, messageId) => {
    const message = await Message.findById(messageId);
    const { isDeleted, deletedUserIds } = message;
    if (isDeleted) return;
    const index = deletedUserIds.findIndex((id) => id === userId);
    if (index != -1) return;
    await Message.updateOne(
      { _id: messageId },
      { $push: { deletedUserIds: userId } }
    );
  },
  deleteAllMessage: async (conversationId, userId) => {
    const member = await Member.findOne({
      conversationId: conversationId,
      userId: userId,
    });
    if (!member) throw new Error("Conversation not found");
    await Message.updateMany(
      {
        conversationId: conversationId,
        deletedUserIds: { $nin: [userId] },
      },
      {
        $push: { deletedUserIds: userId },
      }
    );
  },
  shareMessage: async (conversationId, messageId, userId) => {
    const message = await Message.findById(messageId);
    const user = await User.findById(userId);
    if (!message) throw new NotFoundError("Message");
    const conversation = await Conversation.find({
      _id: message.conversationId,
      members: { $in: [userId] },
    });
    if (!conversation) throw new NotFoundError("Conversation");
    const shareConversation = await Conversation.find({
      _id: conversationId,
      members: { $in: [userId] },
    });
    if (!shareConversation) throw new NotFoundError("Conversation share");
    const shareMessage = new Message({
      content: message.content,
      fileUrls: message.fileUrls,
      senderId: userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      conversationId: conversationId,
      type: message.type,
    });
    const saveMessage = await shareMessage.save();
    await Conversation.updateOne(
      { _id: conversationId },
      { lastMessages: saveMessage._id }
    );
    return saveMessage;
  },
  createFileMessage: async (conversationId, user, content, files) => {
    const folderName = user._id;
    const fileUrls = [];
    for (let index = 0; index < files.length; index++) {
      const error = validate.file(files[index]);
      if (error) throw new MyError(error);
      const url = await messageValidate.uploadFile(folderName, files[index]);
      fileUrls.push(url);
    }
    const message = new Message({
      senderId: user._id,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: content,
      fileUrls: fileUrls,
      type: "TEXTANDFILE",
      conversationId: conversationId,
    });
    await message.save();
    await Conversation.updateOne(
      { _id: conversationId },
      { lastMessages: message._id }
    );
    return message;
  },
  createTextMessage: async (conversationId, user, content) => {
    const errors = validate.content(content);
    if (errors) throw new MyError(errors);
    const message = new Message({
      senderId: user._id,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: content,
      conversationId: conversationId,
    });
    await message.save();
    await Conversation.updateOne(
      { _id: conversationId },
      { lastMessages: message._id }
    );
    return message;
  },
};
module.exports = messageServices;
