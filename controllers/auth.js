const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const OtpModel = require("../models/otp");

const { updateAvatar } = require("../services/upload_file");
const { USER_NOT_FOUND_ERR, PASSWORD_NOT_MATCH_ERR, OTP_NOT_FOUND_ERR, OTP_EXPIRED_ERR } = require("../errors");
const authService = require("../services/auth.service");
const validate = require("../utils/validate")
const userService = require("../services/user.services");

exports.signup = async (req, res, next) => {
  const { email, phoneNumber, password, name } = req.body;
  const errors =  await validate.signup(req.body);
  if (errors) {
    return res.status(500).json({ message: "Validate fail", errors: errors });
  }
  try {
    const user = new User({
      email: email,
      password: password,
      phoneNumber: phoneNumber,
      name: name,
    });
    await authService.signupUser(user);
    const otpData = await authService.createOtpModel(email);
    authService.sendMail(email, otpData.otp);
    console.log(otpData.otp);
    res.status(201).json({ message: "User created.", userId: user._id, otpData_otp: otpData.otp });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode === 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { phoneNumber, password } = req.body;
  const errors = validate.login(req.body);
  if (errors) {
    return res.status(500).json({ message: "Validate fail", errors: errors });
  }
  try {
    const user = await User.findOne({ phoneNumber: phoneNumber });
    if (!user) {
      return res
        .status(404)
        .json({ message: "A user with this phoneNumber could not be found." });
    }
    const isExistOtp = await OtpModel.findOne({email: user.email});
    if(isExistOtp){
      return res.status(500).json({ message: "Account not verify Otp" });
    }
    // if (user.activeOtp === false) {
    //   return res.status(500).json({ message: "Account not verify Otp" });
    // }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      return res.status(404).json({ message: "Wrong password." });
    }
    const token = jwt.sign(
      {
        phoneNumber: user.phoneNumber,
        userId: user._id.toString(),
      },
      "secret",
      { expiresIn: "30d" }
    );
    res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode === 500;
    }
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  const { otp, email } = req.body;
  try {
    const otpData = await OtpModel.findOne({ email: email, otp: otp });
    if(!otp){
      res.status(404).json({message: OTP_NOT_FOUND_ERR})
    }
    const isOtpExpired = await validate.otp(otpData.otpExpiration);
    if(isOtpExpired){
      await otpData.deleteOne();
      return res.status(400).json({message: OTP_EXPIRED_ERR});
    }
    await otpData.deleteOne();
    return res.status(200).json({ message: "Verify success" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.updateAvatar = async (req, res) => {
  const userId = req.userId;
  const image = req.file;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "Could not find user" });
    }
    if (!image) {
      return res.status(500).json({ message: "No image" });
    }
    const imageUrl = await updateAvatar(image);
    const filter = { _id: userId };
    const update = { avatar: imageUrl };
    const updateUser = await User.findOneAndUpdate(filter, update, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "Update avatar success.", user: updateUser });
  } catch (error) {
    res.status(500).json({ message: "Update avatar fail.", error: error });
  }
};

exports.getUser = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId, {
      _id: 1,
      name: 1,
      avatar: 1,
      phoneNumber: 1,
    });
    if (!user) {
      return res.status(500).json({ message: "Could not find user" });
    }
    res.status(200).json({ message: "Get user success", user: user });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};


exports.resendOtp = async (req, res, next) => {
  const { params } = req.body;
  try {
    const user = await userService.getUser(params);
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND_ERR });
    }
    const otpData = await authService.createOtpModel(user.email);
    await authService.sendMail(user.email, otpData.otp);
    res.status(200).json({ message: "Resend success", otpData_otp:otpData.otp });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const errors = validate.password(req.body);
    if (errors) {
      return res.status(500).json({ message: "Validate fail", errors: errors });
    }
    const user = await User.findOne({email: email});
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND_ERR });
    }
    // await authService.resetPassword(user, password);
    const hashedPwd = await bcrypt.hash(password, 12);
    user.password = hashedPwd;
    await user.save();
    const otpData = await authService.createOtpModel(user.email);
    await authService.sendMail(user.email, otpData.otp);
    res.status(200).json({ message: "Reset password success" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.updateName = async (req, res, next) => {
  const userId = req.userId;
  const { name } = req.body;
  try {
    const errors = validate.name(req.body);
    if (errors) {
      return res.status(500).json({ message: "Validate fail", errors: errors });
    }
    const user = await User.findByIdAndUpdate(userId, { name: name });
    if (!user) {
      return res.status(400).json({ message: USER_NOT_FOUND_ERR });
    }
    res.status(200).json({ message: "Update name success", user });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};
