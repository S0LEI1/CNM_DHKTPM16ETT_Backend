const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true,
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Message",
      },
    ],
  },
  { timeseries: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
