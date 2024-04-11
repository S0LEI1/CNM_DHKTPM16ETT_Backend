const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const messageController = require("../controllers/message");
const upload = require("../middleware/upload");


router.post('/text/:conversationId',isAuth,upload.multipleUploadMiddleware, messageController.createTextMessage);
router.post("/file/:conversationId", isAuth,upload.multipleUploadMiddleware, messageController.createFileMessage);
router.delete("/delete/:messageId", isAuth, messageController.deleteMessage);
module.exports = router;