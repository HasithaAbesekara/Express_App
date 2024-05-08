const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

//this crypto is using random bytes genrate
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter valide email"],
    lowercase: true,
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Plaese enter a password."],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      //This walidator only work for save( and create())
      validator: function (val) {
        return val == this.password;
      },
      message: "Passowrd and confirm password does not match",
    },
  },
  passwordChangeAt: Date,
  passowrdResetToken: String,
  passordResetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

//comapre the passowrd
userSchema.methods.comparePassowrdInDb = async function (pswd, pswdDB) {
  return await bcrypt.compare(pswd, pswdDB);
};

userSchema.methods.isPsswordChange = async function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const pswdchangeTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    console.log(pswdchangeTimestamp, JWTTimestamp);

    return JWTTimestamp < pswdchangeTimestamp;
  }
  return false;
};

// craete reusable funtion this is insatnt funtion it will be call user

userSchema.methods.createResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passowrdResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  console.log(resetToken, this.passowrdResetToken);

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
