const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = require("mongoose").Types.ObjectId;
const conversationSchema = new Schema(
  {
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    deputyLeaderId: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chatName: {
      type: String,
      require: true,
    },
    avatar: {
      type: String,
    },
    lastMessages: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    members: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    type: {
      type: String,
      enum: ["SINGLE", "GROUP"],
      default: "SINGLE",
    },
  },
  { timeseries: true }
);
conversationSchema.index({ name: "text" });
const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;

// conversationSchema.static.getListMemberById = async(conversationId) =>{

// }
