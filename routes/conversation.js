const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const conversationController = require("../controllers/conversation");
const memberController = require("../controllers/member");

const upload = require("../middleware/upload");
// /conversation/
router.get("/", isAuth, conversationController.getListConversation);
// /conversation/id
router.get('/:conversationId',isAuth, conversationController.getConversation);

router.post("/single/:receiverId", isAuth, conversationController.createSingleConversation);
router.delete("/:conversationId", isAuth, conversationController.deleteConversation);
router.post("/group", isAuth, upload.singleUploadMiddleware, conversationController.createGroupConversation);

// member

router.get("/member/:conversationId", isAuth, memberController.getList);


module.exports = router;