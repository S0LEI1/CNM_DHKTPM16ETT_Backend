const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { s3 } = require("../utils/aws_hepler");
const message = require("../models/message");
const { updateAvatar } = require("../services/upload_file");
const { generateOTP } = require("../utils/otp");
const { USER_NOT_FOUND_ERR } = require("../errors");
const authService = require("../services/auth.service");
const { validateEmail, validateSignup, validateLogin } = require("../utils/validate");

exports.signup = async (req, res, next) => {
  const { email, phoneNumber, password, name } = req.body;
  const otp = generateOTP(6);
  const errors = await validateSignup(req.body);
  if (errors) {
    return res.status(500).json({ message: "Validate fail", errors: errors });
  }
  try {
    const user = new User({
      email: email,
      password: password,
      phoneNumber: phoneNumber,
      name: name,
      otp: otp,
    });
    await authService.signupUser(user);
    authService.sendMail(email, otp);
    res.status(201).json({ message: "User created.", userId: user._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode === 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { phoneNumber, password } = req.body;
  const errors = validateLogin(req.body);
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
    if (user.activeOtp === false) {
      return res.status(500).json({ message: "Account not verify Otp" });
    }
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
  const { otp } = req.body;
  const { email } = req.params;
  try {
    const user = await authService.getUserByEmail(email);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND_ERR });
    }
    if (user.otp !== otp) {
      return res.status(404).json({ message: "Otp not match" });
    }
    await authService.verifyOtp(user, otp);
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
    const user = await User.findById(userId, { _id: 1, name: 1, avatar: 1 });
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

exports.logout = async (req, res, next) => {
  return res.status(202).clearCookie('token').send('cookie cleared')
};