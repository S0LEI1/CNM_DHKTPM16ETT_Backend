const MyError = require("../exception/MyError");
const NotFoundError = require("../exception/NotFoundErr");
const AddFriend = require("../models/add_friend");
const Conversation = require("../models/conversation");
const Friends = require("../models/friends");
const Member = require("../models/member");
const User = require("../models/user");
const memberValidate = require("../validate/memberValidate");
const ObjectId = require("mongoose").Types.ObjectId;
const friendServices = {
  getListFriendReq: async (_id) => {
    const user = await User.findById(_id);
    console.log(user);
    const addFriendReqs = await AddFriend.aggregate([
      { $match: { receiverId: new Object(_id) } },
      { $project: { _id: 1, senderId: 1, content: 1 } },
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
        $project: {
          sender: {
            _id: 1,
            name: 1,
            avatar: 1,
          },
          content: 1,
          _id: 1,
        },
      },
    ]);

    return addFriendReqs;
  },
  getListFriends: async (userId) => {
    // const friends = await Friends.find({
    //   userIds: { $all: [userId] },
    // }).populate({ path: "userIds" });
    // const friendsInfoId = [];
    // friends.forEach((friend) => {
    //   friend.userIds.forEach((item) => {
    //     if (item._id != userId) {
    //       friendsInfoId.push(item._id);
    //     }
    //   });
    // });
    // return friendsInfoId;
    const friends = Friends.aggregate([
      { $match: { userIds: { $in: [new ObjectId(userId)] } } },
      {
        $lookup: {
          from: "users",
          localField: "userIds",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          user: {
            _id: 1,
            name: 1,
            avatar: 1,
          },
        },
      },
      { $replaceWith: "$user" },
      { $match: { _id: { $ne: new ObjectId(userId) } } },
    ]);
    return friends;
  },
  getListFriendByMemberId: async (conversationId, userId) => {
    const friends = await friendServices.getListFriends(userId);
    if (friends.length <= 0) throw new MyError("User not friend");
    let checkFriend = [];
    for (let index = 0; index < friends.length; index++) {
      const friend = await memberValidate.validateMember(
        conversationId,
        friends[index]
      );
      checkFriend.push(friend);
    }
    return checkFriend;
  },
};

module.exports = friendServices;
