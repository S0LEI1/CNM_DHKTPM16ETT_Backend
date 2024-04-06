const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const singleChatSchema = new Schema(
  {
    conversationId:{
      type: Schema.Types.ObjectId,
      ref:"Conversation",
      require:true
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref:"User",
      require: true,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("SingleChat", singleChatSchema);
