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
    otpExpiration:{
        type: Date,
        default: Date.now,
        get: (otpExpiration) => otpExpiration.getTime(),
        set: (otpExpiration) => new Date(otpExpiration),
    }
})

module.exports = mongoose.model("Otp",otpSchema);