const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendSchema = new Schema({
  userIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

friendSchema.statics.existsByIds = async (userId1, userId2) => {
  const isExists = await Friends.findOne({
      userIds: { $all: [userId1, userId2] },
  });

  if (isExists) return true;

  return false;
};


const Friends = mongoose.model("Friends", friendSchema);
module.exports = Friends;
