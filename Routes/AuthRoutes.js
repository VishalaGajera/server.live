const express = require("express");
const { signup, login, verifyOTP, resendOTP } = require("../Controllers/AuthenticationController.js");
const authRouter = express.Router();
const authMiddleware = require("../middleware/auth.middleware.js");

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/resend-otp", resendOTP);

authRouter.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = authRouter;
