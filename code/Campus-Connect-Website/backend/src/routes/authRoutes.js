const express = require("express");

const {
  requestRegistrationOtp,
  requestPasswordResetOtp,
  register,
  login,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/register/request-otp", requestRegistrationOtp);

router.post("/login", login);

router.post("/forgot-password/request-otp", requestPasswordResetOtp);

router.post("/forgot-password/reset", resetPassword);

router.post("/change-password", protect, changePassword);

module.exports = router;
