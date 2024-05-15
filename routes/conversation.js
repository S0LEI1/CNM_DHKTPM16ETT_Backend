const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const conversationController = require("../controllers/conversation");
const memberController = require("../controllers/member");
const friendController = require("../controllers/friend");
const upload = require("../middleware/upload");
const conversationServices = require("../services/conversation.service");
// /conversation/
router.get("/", isAuth, conversationController.getListConversation);
// /conversation/id
router.get('/:conversationId',isAuth, conversationController.getConversation);
router.get("/con/:conversationId", isAuth, conversationController.getConversationById);
// router.get("/:userId2/byId", isAuth, conversationController.getConversationBy2UserId);
//create
router.post("/single/:receiverId", isAuth, conversationController.createSingleConversation);
router.post("/group", isAuth, upload.singleUploadMiddleware, conversationController.createGroupConversation);

router.delete("/group/:conversationId", isAuth, conversationController.deleteGroupConversation);
// 
router.patch("/rename/:conversationId", isAuth, conversationController.updateGroupName);
router.patch("/avatar/:conversationId", isAuth,upload.singleUploadMiddleware, conversationController.updateGroupAvatar);

// leader & deputy leader
router.patch("/:conversationId/member/:newLeaderId", isAuth, memberController.updateLeader);
router.patch("/:conversationId/deputy/:deputyLeaderId", isAuth, conversationController.addDeputyLeader);
router.patch("/:conversationId/delete/deputy/:deputyLeaderId", isAuth, conversationController.deleteDeputyLeader);

// member

router.get("/member/:conversationId", isAuth, memberController.getList);
router.post("/member/:conversationId", isAuth, memberController.addMember);
router.delete("/member/:conversationId", isAuth, memberController.deleteMember)
router.delete("/member/leave/:conversationId", isAuth, memberController.leaveGroup);


router.get("/:conversationId/friend", isAuth, friendController.getListFriendByMemberId);


//message
router.delete("/message/:conversationId", isAuth, conversationController.deleteAllMessage);

module.exports = router;