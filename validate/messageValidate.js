const { uploadFileToS3 } = require("../services/upload_file");
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
const messageValidate = {
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
  }

}
module.exports = messageValidate;