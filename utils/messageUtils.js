const messageUtils = {
    convertMessage:  (message) =>{
        console.log(message);
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
            _id: message._id,
            content: message.content,
            conversationId: message.conversationId,
            senderId: message.senderId,
            senderName: message.senderName,
            senderAvatar: message.avatar,
            isDeleted: message.isDeleted,
            deletedUserIds: message.deletedUserIds,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
        }
    }
}


module.exports = messageUtils;