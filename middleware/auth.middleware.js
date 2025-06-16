const jwt = require("jsonwebtoken");
const User = require("../Models/AuthModel");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password"); 
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Unauthorized access. Please log in to continue." });
  }
};

module.exports = authMiddleware;
