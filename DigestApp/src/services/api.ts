import { Platform } from 'react-native';
import { Article } from '../types';

// ─── Configuration ──────────────────────────────────
// For physical devices on the same WiFi, use the machine's LAN IP.
// For Android emulator only, use 10.0.2.2 instead.
const LAN_IP = '192.168.1.2';

const getDevBaseUrl = () => {
  // LAN IP works for physical devices (Android & iOS) and iOS Simulator
  return `http://${LAN_IP}:3001/api`;
};

const BASE_URL = __DEV__
  ? getDevBaseUrl()
  : 'https://your-production-url.com/api';

// ─── Types ──────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data: T;
  status?: string;
  message?: string;
  error?: string;
}

// ─── API Client ─────────────────────────────────────
class DigestAPI {
  private baseUrl: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.timeout = 15000; // 15s timeout — full article payloads are larger
  }

  /**
   * Set the JWT auth token for authenticated requests.
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Generic fetch wrapper with timeout and error handling.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    customTimeout?: number
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // AbortController for timeout
    const controller = new AbortController();
    const timeoutMs = customTimeout || this.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Build headers with optional auth
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.warn('[API] Request timed out:', endpoint);
        throw new Error('Request timed out — server may be slow');
      }
      if (error.message === 'Network request failed') {
        console.warn(`[API] Server unreachable at ${this.baseUrl}`);
        throw new Error('Cannot reach server. Make sure backend is running.');
      }
      throw error;
    }
  }

  // ─── Auth Endpoints ─────────────────────────────────

  /**
   * Register a new user. Returns JWT token + user object.
   */
  async register(
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ token: string; user: any }> {
    const response = await this.request<{ token: string; user: any }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName: displayName || '' }),
      }
    );
    // The backend wraps as { success, token, data: { user } }
    // But our request() returns the full body, so token is at response level
    const fullBody = response as any;
    return {
      token: fullBody.token,
      user: fullBody.data?.user || fullBody.user,
    };
  }

  /**
   * Login an existing user. Returns JWT token + user object.
   */
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: any }> {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const fullBody = response as any;
    return {
      token: fullBody.token,
      user: fullBody.data?.user || fullBody.user,
    };
  }

  /**
   * Get the authenticated user's profile.
   */
  async getProfile(): Promise<any> {
    const response = await this.request<{ user: any }>('/auth/profile');
    return response.data;
  }

  /**
   * Update the authenticated user's profile.
   */
  async updateProfile(updates: {
    displayName?: string;
    preferences?: any;
  }): Promise<any> {
    const response = await this.request<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  /**
   * Delete the authenticated user's account.
   */
  async deleteAccount(): Promise<void> {
    await this.request('/auth/account', {
      method: 'DELETE',
    });
  }

  // ─── News Endpoints ─────────────────────────────────

  /**
   * Get paginated news feed.
   * Backend returns: { success, data: { articles, source, fromCache, total, page, limit, hasMore } }
   */
  async getArticles(params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ articles: Article[]; hasMore: boolean; total: number; source: string }> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.set('category', params.category);
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));

    const query = queryParams.toString();
    const endpoint = `/news${query ? `?${query}` : ''}`;
    const response = await this.request<any>(endpoint);

    // New backend nests everything inside data
    const data = response.data || {};

    return {
      articles: data.articles || [],
      hasMore: data.hasMore ?? false,
      total: data.total ?? 0,
      source: data.source || '',
    };
  }

  /**
   * Get a single article by ID.
   * Backend returns: { success, data: { article } }
   */
  async getArticleById(id: string): Promise<Article | null> {
    try {
      const response = await this.request<{ article: Article }>(`/news/${id}`);
      return response.data?.article || null;
    } catch {
      return null;
    }
  }

  /**
   * Get trending articles.
   * Backend returns: { success, data: { articles } }
   */
  async getTrending(limit: number = 5): Promise<Article[]> {
    const response = await this.request<{ articles: Article[] }>(
      `/news/trending?limit=${limit}`
    );
    return response.data?.articles || [];
  }

  /**
   * Search articles by keyword.
   * Backend returns: { success, data: { articles, source } }
   */
  async searchArticles(
    query: string,
    limit: number = 10
  ): Promise<Article[]> {
    const response = await this.request<{ articles: Article[] }>(
      `/news/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data?.articles || [];
  }

  /**
   * Get available categories.
   * Backend returns: { success, data: { categories } }
   */
  async getCategories(): Promise<string[]> {
    const response = await this.request<{ categories: string[] }>(
      '/news/categories'
    );
    return response.data?.categories || [];
  }

  // ─── Bookmark Endpoints ─────────────────────────────

  /**
   * Get bookmarks for a user.
   * Backend returns: { success, data: { bookmarks } }
   * Each bookmark has an embedded `.article` object.
   */
  async getBookmarks(userId: string): Promise<Article[]> {
    try {
      const response = await this.request<{ bookmarks: any[] }>(
        `/user/bookmarks?userId=${userId}`
      );
      const bookmarks = response.data?.bookmarks || [];
      // Extract the embedded article from each bookmark
      return bookmarks.map((b: any) => ({
        ...b.article,
        // Ensure the id field is present (MongoDB uses _id internally)
        id: b.article?.id || b.articleId,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Save a bookmark.
   * Backend returns: { success, data: { bookmark } }
   */
  async saveBookmark(
    userId: string,
    article: Article
  ): Promise<{ bookmarkId: string }> {
    const response = await this.request<{ bookmark: any }>(
      '/user/bookmarks',
      {
        method: 'POST',
        body: JSON.stringify({ userId, article }),
      }
    );
    return { bookmarkId: response.data?.bookmark?._id || '' };
  }

  /**
   * Remove a bookmark.
   */
  async removeBookmark(bookmarkId: string): Promise<void> {
    await this.request(`/user/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
    });
  }

  // ─── AI Chat ───────────────────────────────────────

  /**
   * Send a chat message about an article.
   * Backend returns: { success, data: { answer, isRelevant } }
   */
  async sendChatMessage(
    question: string,
    article: { title: string; content: string; category: string },
    chatHistory: { role: string; content: string }[] = []
  ): Promise<{ answer: string; isRelevant: boolean }> {
    // AI requests need a much longer timeout (45s) since model inference takes time
    const response = await this.request<{ answer: string; isRelevant: boolean }>(
      '/chat',
      {
        method: 'POST',
        body: JSON.stringify({
          question,
          articleTitle: article.title,
          articleContent: article.content,
          articleCategory: article.category,
          chatHistory,
        }),
      },
      45000 // 45s timeout for AI
    );
    return response.data;
  }

  // ─── Health Check ───────────────────────────────────

  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// ─── Export singleton ───────────────────────────────
const api = new DigestAPI(BASE_URL);
export default api;
export { DigestAPI, BASE_URL };
