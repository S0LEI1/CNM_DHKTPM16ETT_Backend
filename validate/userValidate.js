const User = require("../models/user");
const userValidate ={
    checkListUser: async (userIds) =>{
        for (let index = 0; index < userIds.length; index++) {
            const user = User.findOne({_id: userIds[index]});
            if(!user) throw new Error("User not found")
        }
    }
}

module.exports = userValidate;