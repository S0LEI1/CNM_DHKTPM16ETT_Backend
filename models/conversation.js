const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const conversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref:"User",
      require: true,
    },
    chatName: {
      type: String,
      require: true,
    },
    avatar:{
      type: String
    },
    lastMessages: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    type: {
      type: String,
      enum: ["SINGLE", "GROUP"],
      default: "SINGLE",
    },
  },
  { timeseries: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
