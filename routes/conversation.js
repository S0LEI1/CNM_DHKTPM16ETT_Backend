const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const conversationController = require("../controllers/conversation");
// /conversation/
router.get("/", isAuth, conversationController.getConversations);
// /conversation/id
router.get('/:conversationId',isAuth, conversationController.getConversation);
// /conversation/id
router.post('/:receiverId', isAuth, conversationController.createSingleConversation);

module.exports = router;