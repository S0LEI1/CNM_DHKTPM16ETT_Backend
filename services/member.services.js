const Member = require("../models/member")

const memberServices ={
    createMember: async (conversationId, userId) =>{
        const member = new Member({userId: userId, conversationId: conversationId});
        await member.save();
        return member;
    }
}

module.exports = memberServices;