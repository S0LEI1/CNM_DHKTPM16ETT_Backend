require("dotenv").config();
const { s3 } = require("../utils/aws_hepler");
const validate = require("../utils/validate");



const FILE_TYPE = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "video/mp3",
  "video/mp4",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.rar",
  "application/zip",
];

const uploadFile = async (type, folderName, fileType, file) => {
  const filePath = `${new Date().getTime()}-${file?.originalname}`;
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Body: file?.buffer,
    Key: type + "/" + folderName + "/" + fileType + "/" + filePath,
    ContentType: file?.mimetype,
  };
  try {
    const data = await s3.upload(params).promise();
    console.log(data);
    return data.Location;
  } catch (error) {
    console.log("Upload file to S3 fail", error);
  }
};
module.exports = { uploadFile};
