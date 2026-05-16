const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const authMiddleware = catchAsync(async (req, res, next) => {
  // 1) Check Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("No token provided. Please log in.", 401));
  }

  const token = authHeader.split(" ")[1];

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError("User no longer exists.", 401));
  }

  // 4) Attach user to request
  req.user = user;

  next();
});

module.exports = authMiddleware;
