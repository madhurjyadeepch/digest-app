import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { Article } from '../types';

// ─── useNews (infinite scroll + pull-to-refresh) ────

interface UseNewsOptions {
  category?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseNewsReturn {
  articles: Article[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  loadingMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useNews({
  category = '',
  limit = 10,
  autoFetch = true,
}: UseNewsOptions = {}): UseNewsReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const fetchingRef = useRef(false);

  const fetchArticles = useCallback(
    async (pageNum: number, mode: 'initial' | 'refresh' | 'more') => {
      // Prevent duplicate fetches
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        if (mode === 'refresh') {
          setRefreshing(true);
        } else if (mode === 'more') {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const result = await api.getArticles({
          category,
          page: pageNum,
          limit,
        });

        const newArticles = result.articles || [];
        const serverHasMore = result.hasMore ?? newArticles.length >= limit;

        if (mode === 'more' && pageNum > 1) {
          // Append, de-duplicate by ID
          setArticles((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const unique = newArticles.filter((a) => !existingIds.has(a.id));
            return [...prev, ...unique];
          });
        } else {
          // Replace (initial load or pull-to-refresh)
          setArticles(newArticles);
        }


        setHasMore(serverHasMore);
        pageRef.current = pageNum;
      } catch (err: any) {
        console.error('[useNews] Fetch failed:', err.message);
        // Only set error if we have no data at all
        if (articles.length === 0 || mode === 'initial') {
          setError(err.message || 'Failed to fetch news');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      }
    },
    [category, limit]
  );

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      pageRef.current = 1;
      fetchArticles(1, 'initial');
    }
  }, [autoFetch, category]);

  const refresh = useCallback(async () => {
    pageRef.current = 1;
    setHasMore(true);
    await fetchArticles(1, 'refresh');
  }, [fetchArticles]);

  const loadMore = useCallback(async () => {
    if (!hasMore || fetchingRef.current || loadingMore) return;
    const nextPage = pageRef.current + 1;
    await fetchArticles(nextPage, 'more');
  }, [fetchArticles, hasMore, loadingMore]);

  return {
    articles,
    loading,
    error,
    refreshing,
    loadingMore,
    refresh,
    loadMore,
    hasMore,
  };
}

// ─── useTrending ────────────────────────────────────

interface UseTrendingReturn {
  trending: Article[];
  loading: boolean;
  error: string | null;
}

export function useTrending(limit: number = 5): UseTrendingReturn {
  const [trending, setTrending] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const articles = await api.getTrending(limit);
        if (!cancelled) setTrending(articles);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to fetch trending');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [limit]);

  return { trending, loading, error };
}

// ─── useSearch ──────────────────────────────────────

interface UseSearchReturn {
  results: Article[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
}

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const articles = await api.searchArticles(query);
      setResults(articles);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
