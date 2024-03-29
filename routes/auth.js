const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const User = require("../models/user");

const authController = require("../controllers/auth");

router.put("/signup", authController.signup);

router.post("/login", authController.login);

router.put("/update", isAuth, authController.updateAvatar);
router.get("/user", isAuth, authController.getUser);

router.put(
  "/verify/:email",
  [
    body("otp")
      .isNumeric()
      .withMessage("OTP invalid")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP has a 6-digit number"),
  ],
  authController.verifyOtp
);

router.get("/logout", isAuth, authController.logout);

module.exports = router;
