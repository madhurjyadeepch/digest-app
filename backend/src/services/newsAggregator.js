const gnewsService = require('./gnewsService');
const currentsService = require('./currentsService');
const cacheService = require('./cacheService');
const memoryCache = require('./memoryCache');

/**
 * News Aggregator — v2 (Speed + Infinite Scroll)
 *
 * Speed strategy:
 *   1. In-memory cache (< 1ms) → Firestore cache (~200ms) → External API (~800ms)
 *
 * Infinite scroll strategy:
 *   - Maintains a large "article pool" by merging articles across categories
 *   - Each page request returns a different slice from the pool
 *   - Pool is refilled by cycling through categories
 */

// All categories we fetch for the pool
const ALL_CATEGORIES = [
  'general',
  'technology',
  'business',
  'science',
  'health',
  'entertainment',
  'sports',
  'world',
];

class NewsAggregator {
  constructor() {
    // Master pool: all articles we've ever fetched, de-duplicated by ID
    /** @type {Map<string, object>} */
    this._articlePool = new Map();
    this._poolReady = false;
  }

  // ──────────────────────────────────────────────────────
  // MAIN FEED (with infinite scroll support)
  // ──────────────────────────────────────────────────────

  /**
   * Get articles for the feed with infinite scroll.
   *
   * @param {Object} options
   * @param {string} [options.category] - Category filter (empty = all)
   * @param {number} [options.page] - Page number (1-based)
   * @param {number} [options.limit] - Articles per page
   */
  async getArticles({ category = '', page = 1, limit = 10 } = {}) {
    const cacheKey = category
      ? `feed:${category}`
      : 'feed:all';

    // ── 1. In-memory cache (instant) ──
    const memCached = memoryCache.get(cacheKey);
    if (memCached && memCached.length > 0) {
      const paginated = this._paginate(memCached, page, limit);
      if (paginated.length > 0) {
        return {
          articles: paginated,
          source: 'memory',
          fromCache: true,
          total: memCached.length,
          page,
          limit,
          hasMore: (page * limit) < memCached.length,
        };
      }
    }

    // ── 2. Fetch fresh articles ──
    let articles = [];
    let source = '';

    if (category) {
      // Specific category request
      articles = await this._fetchCategory(category);
      source = 'api';
    } else {
      // General feed — build from the pool
      articles = await this._getPoolArticles();
      source = 'pool';
    }

    // ── 3. Cache the result ──
    if (articles.length > 0) {
      memoryCache.set(cacheKey, articles);
      // Fire-and-forget Firestore cache (don't block response)
      cacheService.cacheArticles(cacheKey, articles.slice(0, 20)).catch(() => {});
    }

    const paginated = this._paginate(articles, page, limit);

    return {
      articles: paginated,
      source,
      fromCache: false,
      total: articles.length,
      page,
      limit,
      hasMore: (page * limit) < articles.length,
    };
  }

  /**
   * Fetch articles for a specific category.
   * Tries GNews → Currents → Firestore cache → stale memory.
   */
  async _fetchCategory(category) {
    const gnewsCat = this._mapCategoryToGNews(category);

    // Try GNews
    if (gnewsService.isAvailable()) {
      try {
        const articles = await gnewsService.fetchTopHeadlines({
          category: gnewsCat,
          max: 10,
        });
        if (articles.length > 0) {
          // Add to pool
          articles.forEach((a) => this._articlePool.set(a.id, a));
          return articles;
        }
      } catch (e) {
        console.warn(`[Aggregator] GNews failed for ${category}:`, e.message);
      }
    }

    // Try Currents
    if (currentsService.isAvailable()) {
      try {
        const articles = await currentsService.fetchLatestNews({ category });
        if (articles.length > 0) {
          articles.forEach((a) => this._articlePool.set(a.id, a));
          return articles;
        }
      } catch (e) {
        console.warn(`[Aggregator] Currents failed for ${category}:`, e.message);
      }
    }

    // Fallback to Firestore
    const cached = await cacheService.getCachedArticles(`feed:${category}`);
    if (cached && cached.length > 0) return cached;

    return [];
  }

  /**
   * Get articles from the master pool (for infinite scroll).
   * The pool merges articles from ALL categories.
   */
  async _getPoolArticles() {
    // If pool is already filled, return it sorted by date
    if (this._articlePool.size >= 20) {
      return this._getSortedPool();
    }

    // Fill pool from memory cache of each category
    for (const cat of ALL_CATEGORIES) {
      const cached = memoryCache.get(`feed:${cat}`);
      if (cached) {
        cached.forEach((a) => this._articlePool.set(a.id, a));
      }
    }

    // If still not enough, fetch a couple categories fresh
    if (this._articlePool.size < 10) {
      // Fetch general + technology in parallel for speed
      const fetches = ['general', 'technology', 'science'].map(async (cat) => {
        try {
          return await this._fetchCategory(cat);
        } catch {
          return [];
        }
      });

      const results = await Promise.all(fetches);
      results.flat().forEach((a) => this._articlePool.set(a.id, a));
    }

    return this._getSortedPool();
  }

  /**
   * Return pool articles sorted by publishedAt (newest first),
   * filtered to only include articles with real images.
   */
  _getSortedPool() {
    const articles = Array.from(this._articlePool.values());

    // Filter articles that have proper images
    const withImages = articles.filter(
      (a) => a.imageUrl && !a.imageUrl.includes('picsum')
    );

    // Sort by published date (newest first)
    withImages.sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });

    // If too few with images, include all
    return withImages.length >= 5 ? withImages : articles;
  }

  // ──────────────────────────────────────────────────────
  // SINGLE ARTICLE
  // ──────────────────────────────────────────────────────

  async getArticleById(id) {
    // Check pool first (instant)
    if (this._articlePool.has(id)) {
      return this._articlePool.get(id);
    }

    // Check Firestore
    const cached = await cacheService.getArticleById(id);
    return cached || null;
  }

  // ──────────────────────────────────────────────────────
  // TRENDING
  // ──────────────────────────────────────────────────────

  async getTrendingArticles(limit = 5) {
    const memKey = 'trending';

    // Memory cache
    const memCached = memoryCache.get(memKey);
    if (memCached && memCached.length > 0) {
      return memCached.slice(0, limit);
    }

    let articles = [];

    if (gnewsService.isAvailable()) {
      try {
        articles = await gnewsService.fetchTopHeadlines({
          category: 'general',
          max: 10,
        });
      } catch {
        console.warn('[Aggregator] GNews trending failed');
      }
    }

    if (articles.length === 0 && currentsService.isAvailable()) {
      try {
        articles = await currentsService.fetchLatestNews();
      } catch {
        console.error('[Aggregator] Currents trending also failed');
      }
    }

    if (articles.length > 0) {
      memoryCache.set(memKey, articles);
      articles.forEach((a) => this._articlePool.set(a.id, a));
      cacheService.cacheArticles('feed:trending', articles).catch(() => {});
    }

    return articles.slice(0, limit);
  }

  // ──────────────────────────────────────────────────────
  // SEARCH
  // ──────────────────────────────────────────────────────

  async searchArticles(query, { limit = 10 } = {}) {
    let articles = [];
    let source = '';

    if (gnewsService.isAvailable()) {
      try {
        articles = await gnewsService.searchArticles(query, { max: limit });
        source = 'gnews';
      } catch {
        console.warn('[Aggregator] GNews search failed');
      }
    }

    if (articles.length === 0 && currentsService.isAvailable()) {
      try {
        articles = await currentsService.searchNews(query);
        source = 'currents';
      } catch {
        console.error('[Aggregator] Currents search also failed');
      }
    }

    return { articles: articles.slice(0, limit), source };
  }

  // ──────────────────────────────────────────────────────
  // CACHE REFRESH (cron job)
  // ──────────────────────────────────────────────────────

  async refreshAllCaches() {
    console.log('[Aggregator] Starting full cache refresh...');
    let successCount = 0;

    for (const category of ALL_CATEGORIES) {
      try {
        const articles = await this._fetchCategory(category);
        if (articles.length > 0) {
          memoryCache.set(`feed:${category}`, articles);
          successCount++;
        }
        // Small delay to respect rate limits
        await new Promise((r) => setTimeout(r, 1500));
      } catch (error) {
        console.error(`[Aggregator] Failed "${category}":`, error.message);
      }
    }

    // Refresh the combined "all" feed
    memoryCache.delete('feed:all');

    // Refresh trending
    try {
      await this.getTrendingArticles(10);
      successCount++;
    } catch {
      console.error('[Aggregator] Failed trending');
    }

    this._poolReady = true;
    console.log(
      `[Aggregator] Cache refresh done: ${successCount}/${ALL_CATEGORIES.length + 1} OK | Pool: ${this._articlePool.size} articles`
    );
  }

  // ──────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────

  _mapCategoryToGNews(category) {
    if (!category) return 'general';
    const map = {
      general: 'general',
      world: 'world',
      nation: 'nation',
      business: 'business',
      finance: 'business',
      markets: 'business',
      technology: 'technology',
      tech: 'technology',
      entertainment: 'entertainment',
      culture: 'entertainment',
      sports: 'sports',
      science: 'science',
      health: 'health',
      life: 'general',
      design: 'general',
      environment: 'science',
      politics: 'nation',
    };
    return map[category.toLowerCase()] || 'general';
  }

  _paginate(articles, page, limit) {
    const start = (page - 1) * limit;
    return articles.slice(start, start + limit);
  }
}

module.exports = new NewsAggregator();
