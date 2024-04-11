const AddFriend = require("../models/add_friend");
const Friends = require("../models/friends");
const User = require("../models/user");
const Object = require("mongoose").Types.ObjectId;
const friendServices = {
  getListFriendReq: async (_id) => {
    const user = await User.findById(_id);
    console.log(user);
    const addFriendReqs = await AddFriend.aggregate([
      { $match: { receiverId: new Object(_id) } },
      { $project: { _id: 1, senderId: 1, content:1 } },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "sender",
        },
      },
      { $unwind: "$sender" },
      // { $replaceWith: "$sender" },
      {
        $project: { sender:{
          _id: 1,
          name: 1,
          avatar: 1,
        },
        content:1,
        _id:1
      }
      },
    ]);

    return addFriendReqs;
  },
  getListFriends: async (userId) => {
    const friends = await Friends.find({
      userIds: { $all: [userId] },
    }).populate({ path: "userIds" });
    const friendsInfoId = [];
    friends.forEach((friend) => {
      friend.userIds.forEach((item) => {
        if (item._id != userId) {
          friendsInfoId.push(item._id);
        }
      });
    });
    return friendsInfoId;
  },
};

module.exports = friendServices;
