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


const Friends = mongoose.model("Friends", friendSchema);
module.exports = Friends;
