const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref:"User",
        require: true,
    },
    conversationId:{
        type: Schema.Types.ObjectId,
        ref:"Conversation",
        require:true,
    }
})

const Member = mongoose.model("member", memberSchema);
module.exports = Member;