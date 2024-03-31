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
router.put(
  "/verify/:params",
  [
    body("otp")
      .isNumeric()
      .withMessage("OTP invalid")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP has a 6-digit number"),
  ],
  authController.verifyOtp
);
// /auth/resendOtp
router.get("/resendOtp", authController.resendOtp);
// /auth/logout
// router.get("/logout", isAuth, authController.logout);

router.put("/resetPassword", authController.resetPassword);

module.exports = router;
