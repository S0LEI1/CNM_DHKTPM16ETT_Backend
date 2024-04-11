const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const messageController = require("../controllers/message");
const { manyUpload } = require("../middleware/upload");


// router.post('/text/:conversationId',isAuth,manyUpload, messageController.createTextMessage);
// router.post("/file/:conversationId", isAuth,manyUpload, messageController.createFileMessage);
// router.delete("/delete/:messageId", isAuth, messageController.deleteMessage);
module.exports = router;