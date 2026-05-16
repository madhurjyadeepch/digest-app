const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const Bookmark = require("../models/bookmarkSchema");
const UserPreferences = require("../models/userPreferencesSchema");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    data: { user },
  });
};

// POST /api/auth/register
exports.register = catchAsync(async (req, res, next) => {
  console.log("1. register hit");
  const { email, password, displayName } = req.body;

  console.log("2. body:", email, displayName);

  if (!email || !password) {
    return next(new AppError("Email and password are required.", 400));
  }

  console.log("3. checking existing user");
  const existingUser = await User.findOne({ email });

  console.log("4. existing user check done");
  if (existingUser) {
    return next(new AppError("Email already in use.", 400));
  }

  console.log("5. creating user");
  const user = await User.create({
    email,
    password,
    displayName: displayName || "",
  });

  console.log("6. user created");
  sendToken(user, 201, res);
});

// POST /api/auth/login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required.", 400));
  }

  // password field must have `select: false` in userSchema
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  sendToken(user, 200, res);
});

// GET /api/auth/profile  (protected)
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// PUT /api/auth/profile  (protected)
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { displayName, preferences } = req.body;

  const updateFields = { updatedAt: Date.now() };
  if (displayName !== undefined) updateFields.displayName = displayName;
  if (preferences !== undefined) updateFields.preferences = preferences;

  const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// DELETE /api/auth/account  (protected)
exports.deleteAccount = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  await Promise.all([
    User.findByIdAndDelete(userId),
    Bookmark.deleteMany({ userId }),
    UserPreferences.findByIdAndDelete(userId),
  ]);

  res.status(200).json({
    success: true,
    message: "Account and all associated data deleted.",
  });
});
