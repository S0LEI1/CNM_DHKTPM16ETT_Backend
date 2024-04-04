const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const singleChatSchema = new Schema(
  {
    receriverId: {
      type: Schema.Types.ObjectId,
      ref:"User",
      require: true,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("SingleChat", singleChatSchema);
