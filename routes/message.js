const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const messageController = require("../controllers/message");
const upload = require("../middleware/upload");

router.get("/list/:conversationId", isAuth, messageController.getMessageByConversationId);
router.post('/text/:conversationId',isAuth,upload.multipleUploadMiddleware, messageController.createMessage);
router.post("/file/:conversationId", isAuth,upload.multipleUploadMiddleware, messageController.createFileMessage);
router.delete("/delete/:messageId", isAuth, messageController.deleteMessage);
router.delete("/delete/only/:messageId", isAuth, messageController.deleteOnlyByMe);
router.post("/:messageId/share/:conversationId", isAuth, messageController.shareMessage);
router.post("/notify/:conversationId", isAuth, messageController.createNofifyMessage);
module.exports = router;