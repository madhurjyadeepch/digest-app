/**
 * In-Memory Cache
 * Ultra-fast cache layer that sits IN FRONT of Firestore.
 * All reads hit memory first — responses in <1ms instead of 200-500ms.
 */
class MemoryCache {
  constructor() {
    /** @type {Map<string, { data: any, timestamp: number }>} */
    this.store = new Map();
    this.ttl = (parseInt(process.env.CACHE_TTL_MINUTES, 10) || 30) * 60 * 1000;
  }

  /**
   * Get cached data if fresh.
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache data.
   * @param {string} key
   * @param {any} data
   */
  set(key, data) {
    this.store.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Check if key exists and is fresh.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Remove a specific key.
   * @param {string} key
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Clear everything.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Get cache stats.
   */
  stats() {
    return {
      entries: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

module.exports = new MemoryCache();
