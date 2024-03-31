const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    email:{
        type: String,
        require:true
    },
    otp:{
        type: String,
        require: true
    },
    expiration:{
        type: Date,
        default: Date.now,
        get: (expiration) => expiration.getTime(),
        set: (expiration) => new Date(expiration),
    }
})

module.exports = mongoose.model("Otp",otpSchema);