const messageUtils = {
    convertMessage:  (message) =>{
        const messageId = message.id;
        const isDeleted = message.isDeleted;
        if(isDeleted){
            return {
                messageId,
                isDeleted,
                senderId: message.senderId,
                createAt: message.createAt,
                senderAvatar: message.senderAvatar,
                senderName: message.senderName,
            }
        }
        return {
            _id: message._id,
            content: message.content,
            conversationId: message.conversationId,
            senderId: message.senderId,
            senderName: message.senderName,
            senderAvatar: message.senderAvatar,
            fileUrls: message.fileUrls,
            isDeleted: message.isDeleted,
            deletedUserIds: message.deletedUserIds,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
        }
    }
}


module.exports = messageUtils;