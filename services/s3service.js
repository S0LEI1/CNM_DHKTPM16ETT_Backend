require("dotenv").config();
const { s3 } = require("../utils/aws_hepler");
const MyError = require("../exception/MyError");
const BucketName = process.env.BUCKET_NAME;
const s3Services = {
  async deleteFile(url, bucketName = BucketName) {
    const urlSplit = url.split("/");
    console.log(urlSplit);
    const key =
      urlSplit[urlSplit.length - 4] +
      "/" +
      urlSplit[urlSplit.length - 3] +
      "/" +
      urlSplit[urlSplit.length - 2] +
      "/" +
      urlSplit[urlSplit.length - 1];
    console.log(key);
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (err) {
        console.log(err);
      throw new MyError("Delete file Aws S3 failed");
    }
  },
};

module.exports = s3Services;
