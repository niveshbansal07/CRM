const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.jwtAccessSecret);

    const user = await User.findOne({
      _id: decoded.userId,
      deletedAt: null,
    }).select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or deleted.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}.`,
      });
    }

    req.user = user;
    req.auth = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = {
  authenticate,
};