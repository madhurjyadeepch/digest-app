const Bookmark = require('../models/bookmarkSchema');
const UserPreferences = require('../models/userPreferencesSchema');
const User = require('../models/userSchema');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// ─── Bookmarks ────────────────────────────────────────────────────────────────

exports.saveBookmark = catchAsync(async (req, res, next) => {
  const { userId, article } = req.body;

  if (!userId || !article?.id) {
    return next(new AppError('userId and article.id are required.', 400));
  }

  const bookmarkId = `${userId}_${article.id}`;

  const bookmark = await Bookmark.findByIdAndUpdate(
    bookmarkId,
    {
      _id: bookmarkId,
      userId,
      articleId: article.id,
      article,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Increment bookmarkCount on user
  await User.findByIdAndUpdate(userId, { $inc: { bookmarkCount: 1 } });

  res.status(201).json({
    success: true,
    data: { bookmark },
  });
});

exports.getBookmarks = catchAsync(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new AppError('userId is required.', 400));
  }

  const bookmarks = await Bookmark.find({ userId }).sort({ savedAt: -1 });

  res.status(200).json({
    success: true,
    data: { bookmarks },
  });
});

exports.removeBookmark = catchAsync(async (req, res, next) => {
  const { bookmarkId } = req.params;

  const bookmark = await Bookmark.findByIdAndDelete(bookmarkId);

  if (!bookmark) {
    return next(new AppError('Bookmark not found.', 404));
  }

  // Decrement bookmarkCount on user
  await User.findByIdAndUpdate(bookmark.userId, {
    $inc: { bookmarkCount: -1 },
  });

  res.status(200).json({
    success: true,
    message: 'Bookmark removed.',
  });
});

// ─── Preferences ──────────────────────────────────────────────────────────────

exports.getPreferences = catchAsync(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new AppError('userId is required.', 400));
  }

  // Try dedicated preferences collection first; fall back to user's embedded prefs
  let preferences = await UserPreferences.findById(userId);

  if (!preferences) {
    const user = await User.findById(userId).select('preferences');
    if (!user) return next(new AppError('User not found.', 404));
    preferences = user.preferences;
  }

  res.status(200).json({
    success: true,
    data: { preferences },
  });
});

exports.updatePreferences = catchAsync(async (req, res, next) => {
  const { userId, preferences } = req.body;

  if (!userId || !preferences) {
    return next(new AppError('userId and preferences are required.', 400));
  }

  const updated = await UserPreferences.findByIdAndUpdate(
    userId,
    { ...preferences, updatedAt: Date.now() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Keep user's embedded prefs in sync
  await User.findByIdAndUpdate(userId, {
    preferences,
    updatedAt: Date.now(),
  });

  res.status(200).json({
    success: true,
    data: { preferences: updated },
  });
});
