const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        require: true
    },
    senderName:{
        type: String,
        require: true
    },
    view:{
        inbox: Boolean,
        outbox: Boolean,
        archive: Boolean,
    },
    content:{
        type: String,
        require: true
    },
    read: {
        marked: { type: Boolean, default: false }, // Whether the recipient has read the message
        date: Date, // Date when the message was read
      },
})

module.exports = mongoose.model("Message", messageSchema);
