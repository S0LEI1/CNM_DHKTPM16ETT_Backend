const { USER_NOT_FOUND_ERR } = require("../errors");
const User = require("../models/user");
const userService = {
  getUser: async (payload) => {
    try {
      return await User.findOne( { $or:[{'phoneNumber':payload}, {'email':payload} ]})
    } catch (error) {
      console.log(USER_NOT_FOUND_ERR);
      throw error;
    }
  },
};

module.exports = userService;
