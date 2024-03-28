require("dotenv").config();
const {s3} = require("../utils/aws_hepler");

const FILE_TYPE = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
];

const uploadFile = async(file) =>{
    const filePath = `${new Date().getTime()}-${file?.originalname}`;
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Body: file?.buffer,
        Key: 'image/' +filePath,
        ContentType: file?.mimetype 
    };

    try {
        const data = await s3.upload(params).promise();
        console.log(data);
        return data.Location;
    } catch (error) {
        console.log("Upload file to S3 fail", error);
    }
}
const updateAvatar = async(file) =>{
    const filePath = `${new Date().getTime()}-${file?.originalname}`;
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Body: file?.buffer,
        Key: "avatar/"+ filePath,
        ContentType: file?.mimetype 
    };

    try {
        const data = await s3.upload(params).promise();
        console.log(data);
        return data.Location;
    } catch (error) {
        console.log("Upload file to S3 fail", error);
    }
}
module.exports = {uploadFile, updateAvatar};
