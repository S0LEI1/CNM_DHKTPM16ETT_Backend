const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const message = require("../models/message");
const AddFriend = require("../models/add_friend");
const io = require("../socket");

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation failded.", error: errors.array()[0].msg });
  }
  try {
    const phoneNumber = req.params.phoneNumber;
    if(!validator.isMobilePhone(phoneNumber,"vi-VN") || !validator.isLength(phoneNumber,[{max:10, min:10}])){
      return res.status(500).json({message:"Phone number not validator"})
    }
    const friend = await User.findOne(
      { phoneNumber: phoneNumber },
      { _id: 1, name: 1, avatar: 1 }
    );
    if(!friend){
      return res.status(404).json({message:"User not exist"})
    }
    res.status(200).json({ message: "Find success", friend: friend });
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
    const friendId = req.params.friendId;
    const content = req.body.content;

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
      reciverId: friendId,
      reciverName: friend.name,
      content: content,
    });
    await addFriend.save();
    friend.friendRequests.push(addFriend);
    await friend.save();
    io.getIO().emit("addFriend", {
      action: "create",
      addFriend: {
        ...addFriend._doc,
        creator: { _id: userId, name: user.name },
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
  try {
    const addFriendReq = await AddFriend.findById(addFriendReqId);

    if (!addFriendReq) {
      return res
        .status(404)
        .json({ message: "Could not find Add Friend Request by id" });
    }
    const sender = await User.findById(addFriendReq.senderId);
    const reciver = await User.findById(addFriendReq.reciverId);
    if (!sender) {
      return res.status(404).json({ message: "Could not find user by id" });
    }
    if (!reciver) {
      return res.status(404).json({ message: "Could not reciver user by id" });
    }
    if (status === false) {
      await reciver.updateOne({
        $pull: {
          friendRequests: addFriendReqId,
        },
      });
      await reciver.save();
      await AddFriend.findByIdAndDelete(addFriendReqId);
      return res.status(200).json({ message: "Reciver refuse add friend" });
    } else {
      sender.friends.push(reciver.id);
      reciver.friends.push(sender.id);
      await reciver.updateOne({
        $pull: {
          friendRequests: addFriendReqId,
        },
      });
    }
    await sender.save();
    await reciver.save();
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
