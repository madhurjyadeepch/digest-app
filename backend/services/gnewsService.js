const axios = require("axios");
const { mapGNewsToArticle } = require("../utils/mappers");

const GNEWS_BASE_URL = "https://gnews.io/api/v4";

/**
 * GNews API Service
 * Free tier: 100 requests/day, 10 articles/request
 * Docs: https://gnews.io/docs/v4
 */
class GNewsService {
  constructor() {
    this.apiKey = process.env.GNEWS_API_KEY;
    this.client = axios.create({
      baseURL: GNEWS_BASE_URL,
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
   * Fetch top headlines.
   * @param {Object} options
   * @param {string} [options.category] - general|world|nation|business|technology|entertainment|sports|science|health
   * @param {string} [options.lang] - Language code (default: en)
   * @param {string} [options.country] - Country code (default: us)
   * @param {number} [options.max] - Max articles (1-10, default 10)
   */
  async fetchTopHeadlines({
    category = "general",
    lang = "en",
    country = "us",
    max = 10,
  } = {}) {
    if (!this.isAvailable()) {
      throw new Error("GNews API key not configured");
    }

    try {
      const response = await this.client.get("/top-headlines", {
        params: {
          apikey: this.apiKey,
          category,
          lang,
          country,
          max: Math.min(max, 10),
        },
      });

      const { articles = [] } = response.data;
      return articles.map((article, index) =>
        mapGNewsToArticle(article, index)
      );
    } catch (error) {
      this._handleError(error, "fetchTopHeadlines");
      throw error;
    }
  }

  /**
   * Search for articles by keyword.
   * @param {string} query - Search query
   * @param {Object} options
   * @param {number} [options.max] - Max results (1-10)
   * @param {string} [options.lang] - Language code
   */
  async searchArticles(query, { max = 10, lang = "en" } = {}) {
    if (!this.isAvailable()) {
      throw new Error("GNews API key not configured");
    }

    if (!query || query.trim().length === 0) {
      throw new Error("Search query cannot be empty");
    }

    try {
      const response = await this.client.get("/search", {
        params: {
          apikey: this.apiKey,
          q: query.trim(),
          lang,
          max: Math.min(max, 10),
        },
      });

      const { articles = [] } = response.data;
      return articles.map((article, index) =>
        mapGNewsToArticle(article, index)
      );
    } catch (error) {
      this._handleError(error, "searchArticles");
      throw error;
    }
  }

  /**
   * Handle and log API errors consistently.
   */
  _handleError(error, method) {
    if (error.response) {
      const { status, data } = error.response;
      console.error(
        `[GNews] ${method} failed — HTTP ${status}:`,
        data?.errors || data?.message || data
      );

      if (status === 403) {
        console.error("[GNews] Rate limit exceeded or invalid API key");
      }
    } else if (error.request) {
      console.error(`[GNews] ${method} — No response received (timeout?)`);
    } else {
      console.error(`[GNews] ${method} — ${error.message}`);
    }
  }
}

module.exports = new GNewsService();
