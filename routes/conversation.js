const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const conversationController = require("../controllers/conversation");

router.get("/", isAuth, conversationController.getConversations);
router.get('/:conversationId',isAuth, conversationController.getConversation);
router.post('/:receiverId', isAuth, conversationController.createSingleConversation);

module.exports = router;