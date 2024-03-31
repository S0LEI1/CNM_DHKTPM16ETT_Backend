const validator = require("validator");
const {
  EMAIL_INVALID_ERR,
  USER_EXIST_ERR,
  PHONE_INVALID_ERR,
  PHONE_LENGTH_ERR,
  PASSWORD_ERR,
  PASSWORD_NOT_MATCH_ERR,
  NAME_ERR,
  EMAIL_EXIST_ERR,
  PHONE_EXIST_ERR,
} = require("../errors");
const User = require("../models/user");
const userService = require("../services/user.services");
const REGEX_PASSWORD =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
const REGEX_VN_CHARECTER =
  /[^a-z0-9A-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/u;
module.exports = {
  validateSignup: async (payload) => {
    const { email, phoneNumber, password, confirmPassword, name } = payload;
    const errors = [];

    const user = await User.findOne({
      $or: [{ phoneNumber: phoneNumber }, { email: email }],
    });
    console.log(user);
    if (!validator.isEmail(email)) {
      errors.push(EMAIL_INVALID_ERR);
    }
    if (user) {
      errors.push(EMAIL_EXIST_ERR + "-or-" + PHONE_EXIST_ERR);
    }
    if (!validator.isMobilePhone(phoneNumber)) {
      errors.push(PHONE_INVALID_ERR);
    }
    if (!validator.isLength(phoneNumber, { min: 10, max: 10 })) {
      errors.push(PHONE_LENGTH_ERR);
    }
    if (!REGEX_PASSWORD.test(password)) {
      errors.push(PASSWORD_ERR);
    }
    if (password !== confirmPassword) {
      errors.push(PASSWORD_NOT_MATCH_ERR);
    }
    if (
      !validator.isLength(name, { min: 3, max: 15 }) ||
      !REGEX_VN_CHARECTER.test(name)
    ) {
      errors.push(NAME_ERR);
    }
    if (errors?.length > 0) {
      return errors;
    }
    return null;
  },
  validateLogin: (payload) => {
    const { phoneNumber, password } = payload;
    const errors = [];
    if (!validator.isMobilePhone(phoneNumber)) {
      errors.push(PHONE_INVALID_ERR);
    }
    if (!validator.isLength(phoneNumber, { min: 10, max: 10 })) {
      errors.push(PHONE_LENGTH_ERR);
    }
    if (!REGEX_PASSWORD.test(password)) {
      errors.push(PASSWORD_ERR);
    }
    if (errors?.length > 0) {
      return errors;
    }
    return null;
  },
  validatePassword: (payload) => {
    const { password, confirmPassword } = payload;
    const errors = [];
    if (!REGEX_PASSWORD.test(password)) {
      errors.push(PASSWORD_ERR);
    }
    if (password !== confirmPassword) {
      errors.push(PASSWORD_NOT_MATCH_ERR);
    }
    if (errors?.length > 0) {
      return errors;
    }
    return null;
  },
  validateName: (payload) => {
    const { name } = payload;
    const errors = [];

    if (
      !validator.isLength(name, { min: 2, max: 20 }) &&
      !REGEX_VN_CHARECTER.test(name)
    ) {
      errors.push(NAME_ERR);
    }
    if (errors?.length > 0) {
      return errors;
    }
    return null;
  },
};
