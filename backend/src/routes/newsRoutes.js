const express = require('express');
const router = express.Router();
const newsAggregator = require('../services/newsAggregator');

/**
 * GET /api/news
 * Paginated news feed with optional category filter.
 *
 * Query params:
 *   category - Filter by category (e.g., technology, science, business)
 *   page     - Page number (default: 1)
 *   limit    - Articles per page (default: 10)
 */
router.get('/', async (req, res, next) => {
  try {
    const start = Date.now();
    const { category = '', page = 1, limit = 10 } = req.query;

    const result = await newsAggregator.getArticles({
      category,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    const elapsed = Date.now() - start;
    res.set('X-Response-Time', `${elapsed}ms`);

    res.json({
      success: true,
      data: result.articles,
      meta: {
        source: result.source,
        fromCache: result.fromCache,
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore ?? (result.articles.length >= parseInt(limit, 10)),
        responseTime: `${elapsed}ms`,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/news/trending
 * Top trending articles across all categories.
 *
 * Query params:
 *   limit - Number of articles (default: 5)
 */
router.get('/trending', async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const articles = await newsAggregator.getTrendingArticles(
      parseInt(limit, 10)
    );

    res.json({
      success: true,
      data: articles,
      meta: { total: articles.length },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/news/search
 * Search articles by keyword.
 *
 * Query params:
 *   q     - Search query (required)
 *   limit - Max results (default: 10)
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query parameter "q" is required',
      });
    }

    const result = await newsAggregator.searchArticles(q.trim(), {
      limit: parseInt(limit, 10),
    });

    res.json({
      success: true,
      data: result.articles,
      meta: {
        query: q.trim(),
        source: result.source,
        total: result.articles.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/news/categories
 * List available news categories.
 */
router.get('/categories', async (_req, res, next) => {
  try {
    // World News API supported categories
    const categories = [
      'politics',
      'technology',
      'business',
      'science',
      'health',
      'entertainment',
      'sports',
      'environment',
      'lifestyle',
      'travel',
    ];

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/news/:id
 * Get a single article by ID.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await newsAggregator.getArticleById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
