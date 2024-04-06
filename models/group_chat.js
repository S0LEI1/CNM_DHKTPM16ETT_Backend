const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const groupChatSchema = new Schema(
  {
    conversationId:{
      type: Schema.Types.ObjectId,
      ref:"Conversation",
      require:true
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "User",
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Message",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    permissions: [{ type: String, enum: ["MEMBER"], default: "MEMBER" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupChat", groupChatSchema);
