const { USER_NOT_FOUND_ERR, RECEIVER_NOT_FOUND_ERR } = require("../errors");
const SingleChat = require("../models/single_chat");
const User = require("../models/user");
const { CREATE_CHAT } = require("../success");


// exports.createSingleChat = async(req, res, next) =>{
//     const receiverId = req.params.receiverId;

//     const receiver = await User.findById(receiverId);
  
//     if(!receiver){
//         return res.status(404).json({message: RECEIVER_NOT_FOUND_ERR});
//     }
//     const singleChat = new SingleChat(receiverId);
//     await singleChat.save();
//     res.status(200).json({message:CREATE_CHAT});
// }