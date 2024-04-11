const Member = require("../models/member")

const memberServices ={
    createMember: async (conversationId, userId) =>{
        const member = new Member({userId: userId, conversationId: conversationId});
        await member.save();
        return member;
    },
    // getMemberL: async (consId, userId) =>{
    //     const member = await Member.findOne({consId, userId});
    //     if(!consId){
    //         throw new Error("Member not found");
    //     }
    //     return member;
    // }
}

module.exports = memberServices;