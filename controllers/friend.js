const mongoose = require("mongoose");
const validator = require("validator");
const User = require("../models/user");
const AddFriend = require("../models/add_friend");
const io = require("../socket");
const Friends = require("../models/friends");
const conversationServices = require("../services/conversation.service");
const friendServices = require("../services/friend.services");

exports.getListFriends = async (req, res, next) => {
  const userId = req.userId;
  try {
    const friendIds = await friendServices.getListFriends(userId);
    const friends = await User.find({_id: {$in: friendIds}},{_id:1, name:1, avatar:1})
    if (friends.length <= 0) {
      return res.status(202).json({ message: "users don't have friends!" });
    }
    res
      .status(201)
      .json({ message: "List friends !", friends, userId });
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
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
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
    const isExistFriend = await Friends.existsByIds(userId, friend._id);

    if (isExistFriend) {
      return res.status(200).json({
        message: "Find success",
        friend: friend,
        isExistFriend: isExistFriend,
      });
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
    const isFriend = await Friends.find({userIds:[user._id, friend._id]});
    if(isFriend){
      return res.status(500).json({message:"were friends"});
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

exports.getAddFriendReqs = async (req, res, next) => {
  const userId = req.userId;
  try {
    const addFriendReqs = await friendServices.getListFriendReq(userId);
    if (!addFriendReqs) {
      return res.status(404).json({ message: "Could not find friend request" });
    }
    if (addFriendReqs.length <= 0) {
      return res.status(200).json({ message: "No friend request now " });
    }
    res.status(200).json({
      message: "Get Add Friend Request Success",
      addFriendReqs: addFriendReqs,
      // senders: senders,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};
