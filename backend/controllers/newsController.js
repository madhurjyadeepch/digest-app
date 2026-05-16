const newsAggregator = require("../services/newsAggregator");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const ALL_CATEGORIES = [
  "politics",
  "technology",
  "business",
  "science",
  "health",
  "entertainment",
  "sports",
  "environment",
];

exports.getArticles = catchAsync(async (req, res, next) => {
  const { category = "", page = 1, limit = 10 } = req.query;

  const result = await newsAggregator.getArticles({
    category,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

exports.getTrending = catchAsync(async (req, res, next) => {
  const { limit = 5 } = req.query;

  const articles = await newsAggregator.getTrendingArticles(parseInt(limit));

  res.status(200).json({
    success: true,
    data: { articles },
  });
});

exports.searchArticles = catchAsync(async (req, res, next) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    return next(new AppError('Search query "q" is required.', 400));
  }

  const result = await newsAggregator.searchArticles(q, {
    limit: parseInt(limit),
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: { categories: ALL_CATEGORIES },
  });
});

exports.getArticleById = catchAsync(async (req, res, next) => {
  const article = await newsAggregator.getArticleById(req.params.id);

  if (!article) {
    return next(new AppError("Article not found.", 404));
  }

  res.status(200).json({
    success: true,
    data: { article },
  });
});
