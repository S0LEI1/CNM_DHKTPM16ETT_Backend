const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const User = require("../models/user");

const authController = require("../controllers/auth");

// /auth/signup
router.post("/signup", authController.signup);

// /auth/login
router.post("/login", authController.login);

// /auth/update
router.put("/update", isAuth, authController.updateAvatar);
// /auth/user
router.get("/user", isAuth, authController.getUser);

// /auth/verify/vanngoc@gmail.com
router.post("/verify", authController.verifyOtp);
// /auth/resendOtp
router.get("/resendOtp", authController.resendOtp);

// /auth/resetPassword
router.put("/resetPassword", authController.resetPassword);

// router.put("/updateName", isAuth, authController.updateName);

module.exports = router;
