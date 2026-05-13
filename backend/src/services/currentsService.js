const axios = require('axios');
const { mapCurrentsToArticle } = require('../utils/mappers');

const CURRENTS_BASE_URL = 'https://api.currentsapi.services/v1';

/**
 * Currents API Service (fallback)
 * Free tier: 600 requests/day
 * Docs: https://currentsapi.services/en/docs/
 */
class CurrentsService {
  constructor() {
    this.apiKey = process.env.CURRENTS_API_KEY;
    this.client = axios.create({
      baseURL: CURRENTS_BASE_URL,
      timeout: 10000,
    });
  }

  /**
   * Check if the service is configured.
   */
  isAvailable() {
    return !!this.apiKey;
  }

  /**
   * Fetch latest news.
   * @param {Object} options
   * @param {string} [options.category] - Category filter
   * @param {string} [options.language] - Language code (default: en)
   * @param {string} [options.country] - Country code
   */
  async fetchLatestNews({
    category = '',
    language = 'en',
    country = '',
  } = {}) {
    if (!this.isAvailable()) {
      throw new Error('Currents API key not configured');
    }

    try {
      const params = {
        apiKey: this.apiKey,
        language,
      };

      if (category) params.category = category;
      if (country) params.country = country;

      const response = await this.client.get('/latest-news', { params });

      const { news = [] } = response.data;
      // Currents returns more articles — limit to keep parity with GNews
      return news
        .slice(0, 10)
        .map((article, index) => mapCurrentsToArticle(article, index));
    } catch (error) {
      this._handleError(error, 'fetchLatestNews');
      throw error;
    }
  }

  /**
   * Search news by keyword.
   * @param {string} query - Search query
   * @param {Object} options
   * @param {string} [options.language] - Language code
   */
  async searchNews(query, { language = 'en' } = {}) {
    if (!this.isAvailable()) {
      throw new Error('Currents API key not configured');
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    try {
      const response = await this.client.get('/search', {
        params: {
          apiKey: this.apiKey,
          keywords: query.trim(),
          language,
        },
      });

      const { news = [] } = response.data;
      return news
        .slice(0, 10)
        .map((article, index) => mapCurrentsToArticle(article, index));
    } catch (error) {
      this._handleError(error, 'searchNews');
      throw error;
    }
  }

  /**
   * Get available categories from Currents API.
   */
  async getAvailableCategories() {
    try {
      const response = await this.client.get('/available/categories');
      return response.data?.categories || [];
    } catch (error) {
      console.error('[Currents] Failed to fetch categories:', error.message);
      return [
        'regional',
        'technology',
        'lifestyle',
        'business',
        'general',
        'programming',
        'science',
        'entertainment',
        'world',
        'sports',
        'finance',
        'academia',
        'politics',
        'health',
        'opinion',
        'food',
        'game',
        'energy',
        'travel',
        'music',
        'environment',
        'gaming',
      ];
    }
  }

  /**
   * Handle and log API errors consistently.
   */
  _handleError(error, method) {
    if (error.response) {
      const { status, data } = error.response;
      console.error(
        `[Currents] ${method} failed — HTTP ${status}:`,
        data?.message || data
      );
    } else if (error.request) {
      console.error(`[Currents] ${method} — No response received (timeout?)`);
    } else {
      console.error(`[Currents] ${method} — ${error.message}`);
    }
  }
}

module.exports = new CurrentsService();
