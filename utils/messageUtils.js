const messageUtils = {
    convertMessage:  (message) =>{
        const messageId = message.id;
        const isDeleted = message.isDeleted;
        if(isDeleted){
            return {
                messageId,
                isDeleted,
                user: message.senderId,
                createAt: message.createAt
            }
        }
        return {
            message
        }
    }
}


module.exports = messageUtils;