const express = require("express");
const { signup, login } = require("../Controllers/AuthenticationController");
const authRouter = express.Router();
const authMiddleware = require("../middleware/auth.middleware.js");

authRouter.post("/signup", signup);
authRouter.post("/login", login);

authRouter.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = authRouter;
