const User = require("../models/user");
const userService = {
  getUser: async (payload) => {
    try {
      return await User.findOne( { $or:[{'phoneNumber':payload}, {'email':payload} ]})
    } catch (error) {
      throw error;
    }
  },
};

module.exports = userService;
