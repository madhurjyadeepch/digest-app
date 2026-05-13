const { getDb, isFirebaseAvailable } = require('../config/firebase');

const COLLECTION_ARTICLES = 'cached_articles';
const COLLECTION_CACHE_META = 'cache_metadata';

/**
 * Firestore Cache Service
 * Stores fetched articles to minimize external API calls.
 * Falls back gracefully when Firebase is not configured.
 */
class CacheService {
  /**
   * Get the cache TTL in milliseconds.
   */
  getTTL() {
    const minutes = parseInt(process.env.CACHE_TTL_MINUTES, 10) || 30;
    return minutes * 60 * 1000;
  }

  /**
   * Check if cached data for a given key is still fresh.
   * @param {string} cacheKey - Unique cache key (e.g., "feed:general", "search:bitcoin")
   * @returns {boolean}
   */
  async isCacheFresh(cacheKey) {
    if (!isFirebaseAvailable()) return false;

    try {
      const db = getDb();
      const doc = await db.collection(COLLECTION_CACHE_META).doc(cacheKey).get();

      if (!doc.exists) return false;

      const { updatedAt } = doc.data();
      const age = Date.now() - updatedAt.toMillis();
      return age < this.getTTL();
    } catch (error) {
      console.error(`[Cache] Error checking freshness for "${cacheKey}":`, error.message);
      return false;
    }
  }

  /**
   * Get cached articles for a given key.
   * @param {string} cacheKey
   * @returns {Array|null} Articles array or null if no cache
   */
  async getCachedArticles(cacheKey) {
    if (!isFirebaseAvailable()) return null;

    try {
      const db = getDb();
      const snapshot = await db
        .collection(COLLECTION_ARTICLES)
        .where('cacheKey', '==', cacheKey)
        .orderBy('cachedAt', 'desc')
        .limit(20)
        .get();

      if (snapshot.empty) return null;

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        // Remove Firestore metadata fields from the article object
        const { cacheKey: _ck, cachedAt: _ca, ...article } = data;
        return article;
      });
    } catch (error) {
      console.error(`[Cache] Error reading cache for "${cacheKey}":`, error.message);
      return null;
    }
  }

  /**
   * Store articles in Firestore cache.
   * @param {string} cacheKey
   * @param {Array} articles
   */
  async cacheArticles(cacheKey, articles) {
    if (!isFirebaseAvailable() || !articles || articles.length === 0) return;

    try {
      const db = getDb();
      const batch = db.batch();
      const now = new Date();

      // Store each article
      for (const article of articles) {
        const docRef = db.collection(COLLECTION_ARTICLES).doc(article.id);
        batch.set(
          docRef,
          {
            ...article,
            cacheKey,
            cachedAt: now,
          },
          { merge: true }
        );
      }

      // Update cache metadata
      const metaRef = db.collection(COLLECTION_CACHE_META).doc(cacheKey);
      batch.set(metaRef, {
        cacheKey,
        articleCount: articles.length,
        updatedAt: now,
      });

      await batch.commit();
      console.log(
        `[Cache] Stored ${articles.length} articles for key "${cacheKey}"`
      );
    } catch (error) {
      console.error(`[Cache] Error caching articles for "${cacheKey}":`, error.message);
    }
  }

  /**
   * Get a single article by ID from cache.
   * @param {string} articleId
   * @returns {Object|null}
   */
  async getArticleById(articleId) {
    if (!isFirebaseAvailable()) return null;

    try {
      const db = getDb();
      const doc = await db.collection(COLLECTION_ARTICLES).doc(articleId).get();

      if (!doc.exists) return null;

      const data = doc.data();
      const { cacheKey: _ck, cachedAt: _ca, ...article } = data;
      return article;
    } catch (error) {
      console.error(`[Cache] Error fetching article "${articleId}":`, error.message);
      return null;
    }
  }

  /**
   * Clear all cached articles (useful for force refresh).
   */
  async clearCache() {
    if (!isFirebaseAvailable()) return;

    try {
      const db = getDb();

      // Delete articles
      const articlesSnapshot = await db.collection(COLLECTION_ARTICLES).get();
      const batch = db.batch();
      articlesSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

      // Delete metadata
      const metaSnapshot = await db.collection(COLLECTION_CACHE_META).get();
      metaSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();
      console.log('[Cache] All cached data cleared');
    } catch (error) {
      console.error('[Cache] Error clearing cache:', error.message);
    }
  }
}

module.exports = new CacheService();
