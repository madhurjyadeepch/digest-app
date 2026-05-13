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
  meta?: {
    source?: string;
    fromCache?: boolean;
    total?: number;
    page?: number;
    limit?: number;
    query?: string;
    hasMore?: boolean;
    responseTime?: string;
  };
  error?: string;
}

// ─── API Client ─────────────────────────────────────
class DigestAPI {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.timeout = 15000; // 15s timeout — full article payloads are larger
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

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
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

  // ─── News Endpoints ─────────────────────────────────

  /**
   * Get paginated news feed.
   */
  async getArticles(params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ articles: Article[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.set('category', params.category);
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));

    const query = queryParams.toString();
    const endpoint = `/news${query ? `?${query}` : ''}`;
    const response = await this.request<Article[]>(endpoint);

    return {
      articles: response.data || [],
      meta: response.meta || {},
    };
  }

  /**
   * Get a single article by ID.
   */
  async getArticleById(id: string): Promise<Article | null> {
    try {
      const response = await this.request<Article>(`/news/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  }

  /**
   * Get trending articles.
   */
  async getTrending(limit: number = 5): Promise<Article[]> {
    const response = await this.request<Article[]>(
      `/news/trending?limit=${limit}`
    );
    return response.data || [];
  }

  /**
   * Search articles by keyword.
   */
  async searchArticles(
    query: string,
    limit: number = 10
  ): Promise<Article[]> {
    const response = await this.request<Article[]>(
      `/news/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data || [];
  }

  /**
   * Get available categories.
   */
  async getCategories(): Promise<string[]> {
    const response = await this.request<string[]>('/news/categories');
    return response.data || [];
  }

  // ─── Bookmark Endpoints ─────────────────────────────

  async getBookmarks(userId: string): Promise<Article[]> {
    try {
      const response = await this.request<Article[]>(
        `/user/bookmarks?userId=${userId}`
      );
      return response.data || [];
    } catch {
      return [];
    }
  }

  async saveBookmark(
    userId: string,
    article: Article
  ): Promise<{ bookmarkId: string }> {
    const response = await this.request<{ bookmarkId: string }>(
      '/user/bookmarks',
      {
        method: 'POST',
        body: JSON.stringify({ userId, article }),
      }
    );
    return response.data;
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    await this.request(`/user/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
    });
  }

  // ─── Auth Endpoints ─────────────────────────────────

  async registerProfile(
    uid: string,
    email: string,
    displayName?: string
  ): Promise<void> {
    await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ uid, email, displayName }),
    });
  }

  async getProfile(token: string): Promise<any> {
    const response = await this.request('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  // ─── AI Chat ───────────────────────────────────────

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
