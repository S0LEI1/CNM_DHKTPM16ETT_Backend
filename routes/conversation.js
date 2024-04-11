const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const conversationController = require("../controllers/conversation");
const conversation = require("../models/conversation");
const upload = require("../middleware/upload");
// /conversation/
router.get("/", isAuth, conversationController.getListConversation);
// /conversation/id
router.get('/:conversationId',isAuth, conversationController.getConversation);

// router.post("/:receiverId", isAuth, conversationController.createSingleConversation);
router.post("/group", isAuth, upload.singleUploadMiddleware, conversationController.createGroupConversation);
router.delete("/:conversationId", isAuth, conversationController.deleteConversation);
module.exports = router;