const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      require: true,
      ref:"User"
    },
    senderName: {
      type: String,
      require: true,
    },
    conversationId:{
      type: Schema.Types.ObjectId,
      require: true,
      ref:"Conversation"
    },
    type:{
      type: String,
      enum:["TEXT","FILE","LINK","TEXTANDFILE","TEXTANDLINK"],
      default: "TEXT"
    },
    view: {
      inbox: {
        type: Boolean,
        default: true
      },
      outbox: {
        type: Boolean,
        default: true
      },
      archive: {
        type: Boolean,
        default: false
      },
    },
    content: {
      type: String,
      require: true,
    },
    fileUrls:[{
      type: String,
    }],
    read: {
      marked: { type: Boolean, default: false }, // Whether the recipient has read the message
      date: Date, // Date when the message was read
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
