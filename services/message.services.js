const Message = require("../models/message");
const { uploadFile } = require("./upload_file");
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
  getMessages: async (messagesId) => {
    const messages = await Message.find(
      { _id: messagesId },
      {
        _id: 1,
        content: 1,
        senderId: 1,
        senderName: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );
    // const userMessages = [];
    // const friendMessages = [];
    // for (let index = 0; index < messages.length; index++) {
    //   if (messages[index].senderId.toString() === userId.toString()) {
    //     userMessages.push(messages[index]);
    //   } else friendMessages.push(messages[index]);
    // }
    return messages;
  },
  fileMessage: async (folderName, file) => {
    if (IMAGE_TYPE_MATCH.indexOf(file.mimetype)) {
      return await uploadFile(
        type.CONVERSATIONS,
        folderName,
        fileType.IMAGE,
        file
      );
    }
    if (FILE_TYPE_MATCH.indexOf(file.mimetype)) {
      return await uploadFile(
        type.CONVERSATIONS,
        folderName,
        fileType.FILE,
        file
      );
    }
    if (VIDEO_TYPE_MATCH.indexOf(file.mimetype)) {
      return await uploadFile(
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
};
module.exports = messageServices;
