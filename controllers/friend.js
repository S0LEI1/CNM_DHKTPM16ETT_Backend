const mongoose = require("mongoose");
const validator = require("validator");
const User = require("../models/user");
const AddFriend = require("../models/add_friend");
const io = require("../socket");
const Friends = require("../models/friends");
const conversationServices = require("../services/conversation.service");

exports.getListFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "A user with this email could not be found." });
    }
    const users = await User.find(
      { _id: { $in: user.friends } },
      { name: 1, avatar: 1, _id: 1 }
    );
    if (users.length <= 0) {
      return res.status(202).json({ message: "users don't have friends!" });
    }
    res.status(201).json({ message: "List friends !", users: users });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.getFriend = async (req, res, next) => {
  try {
    const friendId = req.params.friendId;
    const friend = await User.find(
      { _id: friendId },
      { _id: 1, name: 1, avatar: 1 }
    );
    if (!friend) {
      return res.status(404).json({ message: "Could not found friend!" });
    }
    console.log(friend);
    res.status(201).json({ message: "Friend success", friend: friend });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.findFriendByPhone = async (req, res, next) => {
  try {
    const phoneNumber = req.params.phoneNumber;
    if (
      !validator.isMobilePhone(phoneNumber, "vi-VN") ||
      !validator.isLength(phoneNumber, [{ max: 10, min: 10 }])
    ) {
      return res.status(500).json({ message: "Phone number not validator" });
    }
    const friend = await User.findOne(
      { phoneNumber: phoneNumber },
      { _id: 1, name: 1, avatar: 1, phoneNumber: 1 }
    );
    if (!friend) {
      return res.status(404).json({ message: "User not exist" });
    }
    const user = await User.findById(req.userId);
    const isExistFriend = user.friends.includes(friend.id);
    console.log(isExistFriend);
    if (isExistFriend === true) {
      return res
        .status(200)
        .json({ message: "Find success", friend: friend, isExistFriend, user });
    }
    res.status(200).json({ message: "Find success", friend: friend, user });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};
exports.addFriend = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { friendId } = req.params;
    const { content } = req.body;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    if (!user) {
      return res.status(404).json({ message: "Could not find user by id" });
    }
    if (!friend) {
      return res.status(404).json({ message: "Could not find friend by id" });
    }
    const addFriendReq = await AddFriend.findOne({
      senderId: user.id,
      reciverId: friend.id,
    });
    if (addFriendReq) {
      return res.status(500).json({ message: "Friend request already exists" });
    }
    const addFriend = new AddFriend({
      senderId: userId,
      senderName: user.name,
      receiverId: friendId,
      receiverName: friend.name,
      content: content,
    });
    await addFriend.save();
    io.getIO().emit("addFriend", {
      action: "create",
      addFriend: {
        ...addFriend._doc,
        creator: { _id: userId, name: user.name },
      },
    });
    io.getIO().emit("addFriend", {
      action: "create",
      addFriend: {
        ...addFriend._doc,
        creator: { _id: friendId, name: friend.name },
      },
    });
    res.status(200).json({
      message: "Create Add Friend Request Success",
      addFriend: addFriend,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  const addFriendReqId = req.params.addFriendReqId;
  const status = req.body.status;
  const userId = req.userId;
  try {
    const addFriendReq = await AddFriend.findById(addFriendReqId);
    console.log(addFriendReq);
    const { senderId, receiverId } = addFriendReq;
    console.log("receiverId:", receiverId);
    if (!addFriendReq) {
      return res
        .status(404)
        .json({ message: "Could not find Add Friend Request by id" });
    }

    if (status === false) {
      await AddFriend.findByIdAndDelete(addFriendReqId);
      return res.status(200).json({ message: "Reciver refuse add friend" });
    } else {
      const friend = new Friends({ userIds: [senderId, receiverId] });
      await friend.save();
    }
    const conversation = await conversationServices.createSingleConversation(
      senderId,
      receiverId
    );
    io.getIO().emit("create-conversation", {
      action: "create",
      conversation: {
        ...conversation._doc,
        creator: { _id: senderId },
      },
    });
    io.getIO().emit("create-conversation", {
      action: "create",
      conversation: {
        ...conversation._doc,
        creator: { _id: receiverId },
      },
    });
    await AddFriend.findByIdAndDelete(addFriendReqId);
    res.status(200).json({ message: "Add friend success." });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.getAddFriendReq = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Could not find user by id" });
    }
    const addFriendReqs = await AddFriend.find({
      _id: { $in: user.friendRequests },
    });
    if (!addFriendReqs) {
      return res
        .status(404)
        .json({ message: "Could not find Add Friend Request by id" });
    }
    const senders = [];
    for (let index = 0; index < addFriendReqs.length; index++) {
      senders.push(
        await User.findById(addFriendReqs[index].senderId, { avatar: 1 })
      );
    }
    res.status(200).json({
      message: "Get Add Friend Request Success",
      addFriendReqs: addFriendReqs,
      senders: senders,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};
