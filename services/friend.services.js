const AddFriend = require("../models/add_friend");
const Friends = require("../models/friends");
const User = require("../models/user");

const friendServices = {
  getListFriendReq: async (userId) => {
    const addFriendReqs = await AddFriend.find({
      receiverId: userId,
    })
      .populate("senderId", { _id: 1, name: 1, avatar: 1 })
      .exec();
    return addFriendReqs;
  },
  getListFriends: async (userId) => {
    const friends = await Friends.find({
      userIds: { $all: [userId] },
    }).populate({ path: "userIds" });
    const friendsInfoId = [];
    friends.forEach((friend) => {
      friend.userIds.forEach((item) => {
        if(item._id != userId){
            friendsInfoId.push(item._id);
        }
      });
    });
    return friendsInfoId;
  },
};

module.exports = friendServices;
