const axios = require('axios');
const { mapWorldNewsToArticle } = require('../utils/mappers');

const WORLD_NEWS_BASE_URL = 'https://api.worldnewsapi.com';

/**
 * World News API Service
 * Free tier: 500 requests/day, full article text included
 * Docs: https://worldnewsapi.com/docs
 *
 * Strategy:
 *   - /search-news with source-countries=in for India-focused news
 *   - /top-news with source-country=us for global headlines
 *   - /search-news with text query for search
 */
class WorldNewsService {
  constructor() {
    this.apiKey = process.env.WORLD_NEWS_API_KEY;
    this.client = axios.create({
      baseURL: WORLD_NEWS_BASE_URL,
      timeout: 15000,
    });
  }

  /**
   * Check if the service is configured.
   */
  isAvailable() {
    return !!this.apiKey;
  }

  /**
   * Fetch India-focused news with full article text.
   * Uses /search-news with source-countries=in and language=en.
   *
   * @param {Object} options
   * @param {number} [options.number] - Number of articles (max 100, default 20)
   * @param {number} [options.offset] - Pagination offset (default 0)
   * @param {string} [options.categories] - Comma-separated category filter
   * @param {string} [options.sort] - Sort order: publish-time or relevance
   */
  async fetchIndiaNews({
    number = 20,
    offset = 0,
    categories = '',
    sort = 'publish-time',
  } = {}) {
    if (!this.isAvailable()) {
      throw new Error('World News API key not configured');
    }

    try {
      const params = {
        'api-key': this.apiKey,
        'source-countries': 'in',
        language: 'en',
        number: Math.min(number, 100),
        offset,
        sort,
        'sort-direction': 'DESC',
      };

      if (categories) {
        params.categories = categories;
      }

      // Need at least one filter — use earliest-publish-date for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      params['earliest-publish-date'] = sevenDaysAgo.toISOString().split('T')[0];

      const response = await this.client.get('/search-news', { params });
      const { news = [] } = response.data;

      console.log(
        `[WorldNews] Fetched ${news.length} India articles (available: ${response.data.available || '?'})`
      );

      return news.map((article, index) => mapWorldNewsToArticle(article, index));
    } catch (error) {
      this._handleError(error, 'fetchIndiaNews');
      throw error;
    }
  }

  /**
   * Fetch top global news headlines.
   * Uses /top-news endpoint for curated, ranked headlines.
   *
   * @param {Object} options
   * @param {string} [options.sourceCountry] - Country code (default: us)
   * @param {string} [options.language] - Language code (default: en)
   */
  async fetchTopGlobalNews({ sourceCountry = 'us', language = 'en' } = {}) {
    if (!this.isAvailable()) {
      throw new Error('World News API key not configured');
    }

    try {
      const params = {
        'api-key': this.apiKey,
        'source-country': sourceCountry,
        language,
      };

      const response = await this.client.get('/top-news', { params });
      const { top_news: topNews = [] } = response.data;

      // top_news is an array of clusters; pick the first article from each cluster
      const articles = [];
      for (const cluster of topNews) {
        if (cluster.news && cluster.news.length > 0) {
          // Take the top article from each cluster (highest coverage)
          articles.push(cluster.news[0]);
        }
      }

      console.log(
        `[WorldNews] Fetched ${articles.length} top global articles from ${topNews.length} clusters`
      );

      return articles.map((article, index) =>
        mapWorldNewsToArticle(article, index)
      );
    } catch (error) {
      this._handleError(error, 'fetchTopGlobalNews');
      throw error;
    }
  }

  /**
   * Fetch news by category using /search-news.
   * Mixes India news with global news for the given category.
   *
   * @param {string} category - Category name (e.g., technology, sports)
   * @param {Object} options
   * @param {number} [options.number] - Number of articles (default 15)
   */
  async fetchByCategory(category, { number = 15 } = {}) {
    if (!this.isAvailable()) {
      throw new Error('World News API key not configured');
    }

    const mappedCategory = this._mapCategory(category);

    try {
      const params = {
        'api-key': this.apiKey,
        'source-countries': 'in,us,gb',
        language: 'en',
        categories: mappedCategory,
        number: Math.min(number, 50),
        sort: 'publish-time',
        'sort-direction': 'DESC',
      };

      // Need at least one date filter when sorting by publish-time
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      params['earliest-publish-date'] = threeDaysAgo.toISOString().split('T')[0];

      const response = await this.client.get('/search-news', { params });
      const { news = [] } = response.data;

      console.log(
        `[WorldNews] Fetched ${news.length} articles for category "${category}" (mapped: ${mappedCategory})`
      );

      return news.map((article, index) => mapWorldNewsToArticle(article, index));
    } catch (error) {
      this._handleError(error, `fetchByCategory(${category})`);
      throw error;
    }
  }

  /**
   * Search for news articles by keyword.
   *
   * @param {string} query - Search query
   * @param {Object} options
   * @param {number} [options.number] - Max results (default 15)
   */
  async searchNews(query, { number = 15 } = {}) {
    if (!this.isAvailable()) {
      throw new Error('World News API key not configured');
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    try {
      const params = {
        'api-key': this.apiKey,
        text: query.trim(),
        language: 'en',
        number: Math.min(number, 50),
        sort: 'publish-time',
        'sort-direction': 'DESC',
      };

      const response = await this.client.get('/search-news', { params });
      const { news = [] } = response.data;

      console.log(
        `[WorldNews] Search "${query}" returned ${news.length} results`
      );

      return news.map((article, index) => mapWorldNewsToArticle(article, index));
    } catch (error) {
      this._handleError(error, `searchNews("${query}")`);
      throw error;
    }
  }

  // ─── Helpers ─────────────────────────────────────────

  /**
   * Map our internal category names to World News API categories.
   * World News API categories: politics, sports, business, technology,
   * entertainment, science, health, environment, lifestyle, travel, etc.
   */
  _mapCategory(category) {
    if (!category) return 'politics';

    const map = {
      general: 'politics',
      world: 'politics',
      nation: 'politics',
      politics: 'politics',
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
      environment: 'environment',
      lifestyle: 'lifestyle',
      travel: 'travel',
      education: 'politics',
      energy: 'environment',
      programming: 'technology',
      gaming: 'entertainment',
      design: 'entertainment',
    };

    return map[category.toLowerCase()] || 'politics';
  }

  /**
   * Handle and log API errors consistently.
   */
  _handleError(error, method) {
    if (error.response) {
      const { status, data } = error.response;
      console.error(
        `[WorldNews] ${method} failed — HTTP ${status}:`,
        data?.message || data
      );

      if (status === 402) {
        console.error('[WorldNews] API quota exceeded — falling back to other sources');
      }
      if (status === 401) {
        console.error('[WorldNews] Invalid API key');
      }
    } else if (error.request) {
      console.error(`[WorldNews] ${method} — No response received (timeout?)`);
    } else {
      console.error(`[WorldNews] ${method} — ${error.message}`);
    }
  }
}

module.exports = new WorldNewsService();
