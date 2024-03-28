const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email:{
    type: String,
    required: true, 
  },
  phoneNumber: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar:{
    type: String,
    require: false
  },
  friends:[
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
  ],
  conversations:[
    {
      type: Schema.Types.ObjectId,
      ref:"Conversation"
    }
  ],
  friendRequests:[
    {
      type: mongoose.Types.ObjectId,
      ref:"AddFriend"
    }
  ]
},{ timestamps: true });
module.exports = mongoose.model("User", userSchema);
