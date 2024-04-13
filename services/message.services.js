const NotFoundError = require("../exception/NotFoundErr");
const Conversation = require("../models/conversation");
const Member = require("../models/member");
const Message = require("../models/message");
const { uploadFileToS3 } = require("./upload_file");
const IMAGE_TYPE_MATCH = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
const FILE_TYPE_MATCH = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.rar",
  "application/zip",
];
const VIDEO_TYPE_MATCH = ["video/mp3", "video/mp4"];
const type = {
  USERS: "users",
  CONVERSATIONS: "conversations",
};
const fileType = {
  IMAGE: "image",
  FILE: "file",
  VIDEO: "video",
};
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
        createdAt: 1,
        updatedAt: 1,
        isDeleted: 1,
        deletedUserIds: 1,
      }
    ).sort({ createdAt: -1 });
    return messages;
  },
  uploadFile: async (folderName, file) => {
    if (IMAGE_TYPE_MATCH.indexOf(file.mimetype)) {
      return await uploadFileToS3(
        type.CONVERSATIONS,
        folderName,
        fileType.IMAGE,
        file
      );
    }
    if (FILE_TYPE_MATCH.indexOf(file.mimetype)) {
      return await uploadFileToS3(
        type.CONVERSATIONS,
        folderName,
        fileType.FILE,
        file
      );
    }
    if (VIDEO_TYPE_MATCH.indexOf(file.mimetype)) {
      return await uploadFileToS3(
        type.CONVERSATIONS,
        folderName,
        fileType.VIDEO,
        file
      );
    } else {
      console.log("Invalid");
      return null;
    }
  },
  deleteMessageById: async (userId, messageId) => {
    const message = await Message.findById(messageId);
    const conversationId = message.conversationId;
    if (!message) throw new Error("Message not found");
    if (message.senderId != userId)
      throw new Error("You not permission delete message");
    await Message.updateOne({ _id: messageId }, { isDeleted: true });
    return { conversationId };
  },
  deleteOnlyByMe: async (userId, messageId) =>{
    const message = await Message.findById(messageId);
    const {isDeleted, deletedUserIds} = message;
    if(isDeleted) return;
    const index = deletedUserIds.findIndex((id)=> id === userId);
    if(index != -1) return ;
    await Message.updateOne({_id: messageId}, {$push:{deletedUserIds: userId}});
  },
  deleteAllMessage: async(conversationId, userId) =>{
    const member = await Member.findOne({conversationId: conversationId, userId: userId});
    if(!member) throw new Error("Conversation not found");
    await Message.updateMany(
      {
        conversationId: conversationId,
        deletedUserIds:{$nin:[userId]}
      },
      {
        $push: {deletedUserIds: userId}
      }
    )
  },
  shareMessage: async(conversationId, messageId, userId) =>{
    const message= await Message.findById(messageId);
    if(!message) throw new NotFoundError("Message");
    const conversation = await Conversation.find({_id: message.conversationId, members:{$in: [userId]}});
    if(!conversation) throw new NotFoundError("Conversation");
    const shareConversation = await Conversation.find({_id: conversationId, members:{$in: [userId]}});
    if(!shareConversation) throw new NotFoundError("Conversation share");
    const shareMessage = new Message({
      content: message.content,
      userId: userId,
      conversationId: conversationId,
      type: message.type
    });
    const saveMessage = await shareMessage.save();
    await Conversation.updateOne(
      {_id: conversationId},
      {lastMessages: saveMessage._id}
    );
    return saveMessage;
  }
};
module.exports = messageServices;
