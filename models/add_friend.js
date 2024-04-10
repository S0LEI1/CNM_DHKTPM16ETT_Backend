const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addFriendSchema = new Schema({
    senderId:{
        type: mongoose.Types.ObjectId,
        require:true,
        ref:"User"
    },
    senderName:{
        type: String,
        require: true
    },
    receiverId:{
        type: mongoose.Types.ObjectId,
        require:true,
        ref:"User"
    },
    receiverName:{
        type: String,
        require: true
    },
    content:{
        type: String,
        default:"Xin chào bạn.  "
    },
    status:{
        type:Boolean,
        default: false
    }
})

module.exports = mongoose.model("AddFriend", addFriendSchema);