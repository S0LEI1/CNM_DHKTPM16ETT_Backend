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

memberSchema.statics.getByConversationIdAndUserId = async (
    conversationId,
    userId,
) => {
    const member = await Member.findOne({
        conversationId,
        userId,
    });

    if (!member) throw  new Error("Conversation not found");

    return member;
};

const Member = mongoose.model("member", memberSchema);
module.exports = Member;