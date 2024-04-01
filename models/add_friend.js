const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addFriendSchema = new Schema({
    senderId:{
        type: mongoose.Types.ObjectId,
        require:true,
    },
    senderName:{
        type: String,
        require: true
    },
    reciverId:{
        type: mongoose.Types.ObjectId,
        require:true,
    },
    reciverName:{
        type: String,
        require: true
    },
    content:{
        type: String,
        default:"Xin chào bạn."
    },
    status:{
        type:Boolean,
        default: false
    }
})

module.exports = mongoose.model("AddFriend", addFriendSchema);