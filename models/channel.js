const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const channelSchema = new Schema(
    {
        name:{
            type: String,
            require: true
        },
        conversationId:{
            type: Schema.Types.ObjectId,
            require: true,
            ref: "Conversation"
        }
    },
    {
        timestamps: true
    }
)
const Channel = mongoose.model('channel', channelSchema)
module.exports = Channel;