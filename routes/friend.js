const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const friendController = require("../controllers/friend");

router.get("/list", isAuth, friendController.getListFriends);
router.get("/:friendId", isAuth, friendController.getFriend);
router.get(
  "/find/:phoneNumber",
  isAuth,
  friendController.findFriendByPhone
);
router.post("/add/:friendId", isAuth, friendController.addFriend);
router.put("/status/:addFriendReqId", isAuth, friendController.updateStatus);
router.get("/list/req", isAuth, friendController.getListAddFriendReqs);


module.exports = router;
