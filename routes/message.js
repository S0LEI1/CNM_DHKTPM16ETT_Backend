const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const messageController = require("../controllers/message");


router.post('/text/:conversationId',isAuth, messageController.createTextMessage);
router.post("/file/:conversationId", isAuth, messageController.createFileMessage);

module.exports = router;