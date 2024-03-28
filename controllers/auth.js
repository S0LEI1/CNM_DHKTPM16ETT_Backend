const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { s3 } = require("../utils/aws_hepler");
const message = require("../models/message");
const { updateAvatar } = require("../services/upload_file");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation failded.", error: errors.array()[0].msg });
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  try {
    const hashedPwd = await bcrypt.hash(password, 12);
    const friends = [];
    const f1 = new mongoose.Types.ObjectId("65f25fc9594533753321fde7");
    friends.push(f1);
    const conversations = [];
    const user = new User({
      email: email,
      password: hashedPwd,
      name: name,
      friends: friends,
      conversations: conversations,
    });
    await user.save();
    res.status(201).json({ message: "User created.", userId: user._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode === 500;
    }
    next(err);
  }
};
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation failded.", error: errors.array()[0].msg });
  }
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "A user with this email could not be found." });
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      return res.status(404).json({ message: "Wrong password." });
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "secret",
      { expiresIn: "12h" }
    );
    res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode === 500;
    }
    next(err);
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
