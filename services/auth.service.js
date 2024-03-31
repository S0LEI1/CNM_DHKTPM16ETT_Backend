const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const userService = require("./user.services");
const { generateOTP } = require("../utils/otp");
const authService = {
  signupUser: async (user) => {
    const hashedPwd = await bcrypt.hash(user.password, 12);
    user.password = hashedPwd;
    await user.save();
  },
  sendMail: async (email, otp) => {
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
    <b>Please use the following One Time Password (OTP) to access the form: ${otp}. Do not share this ITO with any</b><br>
    <b>Thank you</>
  `;
    const info = await transporter.sendMail({
      from: '"ChatChit 👻" <chatchit16att@gmail.com>', // sender address
      to: email,
      subject: "Signup success ✔",
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
};
module.exports = authService;
