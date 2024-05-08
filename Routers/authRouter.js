const express = require("express");
const authController = require("./../Controllers/authController");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotPassowrd").post(authController.forgotPassowrd);
router.route("/resetPassowrd/:token").patch(authController.resetPassword);

module.exports = router;
