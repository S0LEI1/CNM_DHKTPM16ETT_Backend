const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const User = require("../models/user");

const authController = require("../controllers/auth");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Email invalid")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists.");
          }
        });
      }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 9 to 15 characters"),
    body("name").trim().not().isEmpty().withMessage("Name not empty"),
  ],
  authController.signup
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Phone number must be 10 digits."),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password too short"),
  ],
  authController.login
);

router.put("/update", isAuth, authController.updateAvatar);
router.get("/user", isAuth, authController.getUser);
module.exports = router;
