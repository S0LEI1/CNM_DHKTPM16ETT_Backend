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
const FILE_TYPE_MATCH = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "video/mp3",
  "video/mp4",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.rar",
  "application/zip",
];
const AVATAR_TYPE_MATCH = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

const validate = {
  signup: async (payload) => {
    const { email, phoneNumber, password, confirmPassword, name } = payload;
    const errors = [];
    const user = await User.findOne({
      $or: [{ phoneNumber: phoneNumber }, { email: email }],
    });
    console.log(user);
    if (!validator.isEmail(email)) {
      errors.push(EMAIL_INVALID_ERR);
      s;
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
  login: (payload) => {
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
  password: (payload) => {
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
  name: (payload) => {
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
  otp: async (otpTime) => {
    try {
      console.log("Milliseconds is" + otpTime);
      const cDate = new Date();
      var differenceValue = (otpTime - cDate.getTime()) / 1000;
      differenceValue /= 60;
      const minutes = Math.abs(differenceValue);
      console.log("Expired minutes:-", minutes);
      if (minutes > 2) {
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  },
  avatar: (file) => {
    const errors = [];
    if (FILE_TYPE_MATCH.indexOf(file.mimetype) === -1) {
      errors.push(`${file?.originalname} is invalid`);
    }
    if (errors?.length > 0) return errors;
    return null;
  },
  file: (file) => {
    const errors = [];
    if (FILE_TYPE_MATCH.indexOf(file.mimetype) === -1) {
      errors.push(`${file?.originalname} is invalid`);
    }
    if (errors?.length > 0) return errors;
    return null;
  },
  content: (content) =>{
    const errors = [];
    const trimContent = validator.trim(content);
    if(!validator.isLength(trimContent,{min:1})){
      errors.push("Content not null");
    }
    if(errors?.length > 0){
      return errors;
    }
    return null;
  }
};
module.exports = validate;
