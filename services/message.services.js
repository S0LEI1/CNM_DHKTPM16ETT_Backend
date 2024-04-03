const Message = require("../models/message");

const messageServices = {
    getMessages: async (userId) =>{
        return await Message.find({ _id: userId },{_id:1, content:1, senderId:1, senderName:1})
    }
}
module.exports = messageServices;