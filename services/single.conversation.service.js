const Member = require("../models/member");
const ObjectId = require("mongoose").Types.ObjectId;
const singleConversationServices = {
    getSingleConversation: async (consId, userId) => {
        const datas = await Member.aggregate([
          {
            $match: {
              conversationId:new ObjectId(consId),
              userId: { $ne:new ObjectId(userId) },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: "$user",
          },
          {
            $project: {
              _id: 0,
              name: "$user.name",
              avatar: "$user.avatar",
            },
          },
        ]);
    
        return datas[0];
      },
}

module.exports = singleConversationServices;