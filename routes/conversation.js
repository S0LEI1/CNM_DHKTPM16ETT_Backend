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
router.post("/group", isAuth, upload.singleUploadMiddleware, conversationController.createGroupConversation);
router.delete("/group/:conversationId", isAuth, conversationController.deleteGroupConversation);
// member

router.get("/member/:conversationId", isAuth, memberController.getList);
router.post("/member/:conversationId", isAuth, memberController.addMember);
router.delete("/member/:conversationId", isAuth, memberController.deleteMember)
router.delete("/member/leave/:conversationId", isAuth, memberController.leaveGroup);


//message
router.delete("/message/:conversationId", isAuth, conversationController.deleteAllMessage);

module.exports = router;