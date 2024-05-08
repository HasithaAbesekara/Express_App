const User = require("./../Models/userModel");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const CustomError = require("./../Utils/CoustomError");
const util = require("util");
const sendEmail = require("./../Utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

const createSendResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: "Succesfull",
    token,
    data: {
      user,
    },
  });
};

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  //Get currect user Data from DataBase

  const user = await User.findById(req.user._id).select("+password");
  //Check if the supplied currecnt passowrd is correct
  if (
    !(await user.comparePassowrdInDb(req.body.currentPassword, user.password))
  ) {
    return next(
      new CustomError("The current password you provide is wrong", 401)
    );
  }
  //Ifsupplied password is correct ,upadete user passowrd with new value

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  //Login User & send JWT
  createSendResponse(user, 201, res);
});
