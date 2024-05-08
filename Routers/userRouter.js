const express = require("express");
const authController = require("./../Controllers/authController");
const userController = require("./../Controllers/userController");

const router = express.Router();

router
  .route("/upadatePassowrd")
  .patch(authController.protect, userController.updatePassword);

module.exports = router;
