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
    // avatar:{
    //   type: String
    // },
    lastMessages: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    members:[
      {
        type: Schema.Types.ObjectId,
        ref:"Member"
      }
    ],
    type: {
      type: String,
      enum: ["SINGLE", "GROUP"],
      default: "SINGLE",
    }
  },
  { timeseries: true }
);
conversationSchema.index({ name: 'text' });
module.exports = mongoose.model("Conversation", conversationSchema);
