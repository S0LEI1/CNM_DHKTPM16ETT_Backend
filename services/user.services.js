const { USER_NOT_FOUND_ERR } = require("../errors");
const User = require("../models/user");
const userService = {
  // getUserById: async (userId) => {
  //   try {
  //     return await User.findById(userId, {
  //       _id: 1,
  //       name: 1,
  //       avatar: 1,
  //       conversations: 1,
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  getUser: async (payload) => {
    try {
      return await User.findOne({
        $or: [{ phoneNumber: payload }, { email: payload }],
      });
    } catch (error) {
      console.log(USER_NOT_FOUND_ERR);
      throw error;
    }
  },
  removeConversation: async (userId, consId) => {
    try {
      return await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { conversations: consId } },
        { safe: true, multi: false }
      );
    } catch (error) {
      throw error;
    }
  },
};

module.exports = userService;
