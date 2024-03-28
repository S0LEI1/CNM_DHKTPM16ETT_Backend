const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const messageController = require("../controllers/message");


router.put('/createMessage/:conversationId',isAuth, messageController.createMessage);


module.exports = router;