const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    senderName: {
      type: String,
      require: true,
    },
    type:{
      type: String,
      enum:["TEXT","FILE","LINK","TEXTANDFILE","TEXTANDLINK"],
      default: "TEXT"
    },
    view: {
      inbox: Boolean,
      outbox: Boolean,
      archive: Boolean,
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
