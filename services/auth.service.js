const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const userService = require("./user.services");
const otpGenerator = require("otp-generator");
const OtpModel = require("../models/otp")
const authService = {
  signupUser: async (user) => {
    const hashedPwd = await bcrypt.hash(user.password, 12);
    user.password = hashedPwd;
    await user.save();
  },
  sendMail: async (email, otp, subject) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const html = `<h3>Hi,</h3><br>
    <p>Please use the following One Time Password (OTP) to access the form: <b>${otp}</b>. Do not share this OTP with any</b><br>
    <b>Thank you</p>
  `;
    const info = await transporter.sendMail({
      from: '"ChatChit 👻" <chatchit16att@gmail.com>', // sender address
      to: email,
      subject: `${subject} ✔`,
      text: "Hello world?", // plain text body
      html: html, // html body
    });
  },
  verifyOtp: async (user, otp) => {
    try {
      user.otp = "";
      user.activeOtp = true;
      await user.save();
    } catch (error) {
      throw error;
    }
  },
  resetPassword: async (user, password) => {
    try {
      const hashedPwd = await bcrypt.hash(password, 12);
      user.password = hashedPwd;
      user.activeOtp = false;
      user.otp = generateOTP(6);
      await user.save();
    } catch (error) {
      console.log("Reset password faild");
      throw error;
    }
  },
  createOtpModel: async(email) =>{
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const cDate = new Date();
    return await OtpModel.findOneAndUpdate(
      { email: email },
      { otp, expiration: new Date(cDate.getTime()) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};
module.exports = authService;
