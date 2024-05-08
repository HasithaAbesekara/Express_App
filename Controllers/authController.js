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

exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  createSendResponse(newUser, 201, res);
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  //object destruturing
  //const {email,password}=req.body;

  //check if emil & password is present in requet body
  if (!email || !password) {
    const error = new CustomError(
      "Please provide email ID & password fro login in!",
      400
    );
    return next(error);
  }

  //check if user exists with given email
  const user = await User.findOne({ email }).select("+password");

  // const isMatch = await user.comparePassowrdInDb(password, user.password);

  //check if the user exists & password matches
  if (!user || !(await user.comparePassowrdInDb(password, user.password))) {
    const error = new CustomError("Incorrwect email or password", 400);
    return next(error);
  }

  createSendResponse(user, 200, res);
});

exports.protect = asyncErrorHandler(async (req, res, next) => {
  //1 .Read the token & check if it exist

  const testtoken = req.headers.authorization;
  let token;
  if (testtoken && testtoken.startsWith("Bearer")) {
    token = testtoken.split(" ")[1];
  }
  // console.log(token);
  if (!token) {
    next(new CustomError("You are not logged in!", 401));
  }

  //2 .Validate the token
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );
  console.log(decodedToken);

  //3 .If the user exists
  const user = await User.findById(decodedToken.id);

  if (!user) {
    const error = new CustomError(
      "The user with the given token does not exist",
      401
    );
    next(error);
  }

  //4 .If the user change passowrd after the token was issued

  const isPasswordChange = await user.isPsswordChange(decodedToken.iat);
  if (isPasswordChange) {
    const error = new CustomError(
      "The passowrd has been chagne recently.please login agin",
      401
    );
    return next(error);
  }
  //5 .Allow user to access route
  req.user = user;
  next();
});

exports.restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      const error = new CustomError(
        "You do not have permission to perform this action",
        403
      );
      next(error);
    }
    next();
  };
};

exports.forgotPassowrd = asyncErrorHandler(async (req, res, next) => {
  //1. Get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    const error = new CustomError(
      "we could not find the user with given email",
      404
    );
    next(error);
  }

  //2. Generate a random restet token
  const resetToken = await user.createResetPasswordToken();
  console.log(resetToken);

  await user.save({ validateBeforeSave: false });

  //3. send the token back to the email
  //crate a reset urL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassowrd/${resetToken}`;
  const message = `we have recived a password rest request.please use the below liknk ro reset your passord\n\n${resetUrl}\n\nThis reset password lik will be valid only for 10 minits`;
  try {
    //send email file to some options
    await sendEmail({
      email: user.email,
      subject: "Password change request recived",
      message: message,
    });

    res.status(200).json({
      status: "Succefull",
      message: "password reste link send to the user email",
    });
  } catch (error) {
    user.passowrdResetToken = undefined;
    user.passordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new CustomError(
        "The was an error sending passord reset email.please try agin later",
        500
      )
    );
  }
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passowrdResetToken: token,
    passordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passowrdResetToken = undefined;
  user.passordResetTokenExpires = undefined;
  user.passwordChangeAt = Date.now();

  user.save();

  createSendResponse(user, 200, res);
});
