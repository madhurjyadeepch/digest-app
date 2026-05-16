const Article = require("../models/articleSchema");

/**
 * MongoDB Cache Service
 * Replaces the Firestore cacheService.
 * Persists articles to MongoDB as a backup cache layer.
 */

/**
 * Save articles to MongoDB (upsert by _id).
 * @param {string} cacheKey - e.g. 'feed:technology'
 * @param {object[]} articles
 */
exports.cacheArticles = async (cacheKey, articles) => {
  if (!articles || articles.length === 0) return;

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours TTL

  const ops = articles.map((article) => ({
    updateOne: {
      filter: { _id: article.id },
      update: {
        $set: {
          ...article,
          _id: article.id,
          fetchedAt: new Date(),
          expiresAt,
        },
      },
      upsert: true,
    },
  }));

  await Article.bulkWrite(ops);
};

/**
 * Get cached articles by cache key (category-based query).
 * @param {string} cacheKey - e.g. 'feed:technology'
 * @returns {object[]}
 */
exports.getCachedArticles = async (cacheKey) => {
  const category = cacheKey.replace("feed:", "");

  const filter =
    category === "all" || category === "trending"
      ? {}
      : { category: { $regex: new RegExp(category, "i") } };

  const articles = await Article.find(filter)
    .sort({ publishedAt: -1 })
    .limit(30)
    .lean();

  // Map _id back to id for aggregator compatibility
  return articles.map((a) => ({ ...a, id: a._id }));
};

/**
 * Get a single cached article by ID.
 * @param {string} id
 * @returns {object|null}
 */
exports.getArticleById = async (id) => {
  const article = await Article.findById(id).lean();
  if (!article) return null;
  return { ...article, id: article._id };
};
