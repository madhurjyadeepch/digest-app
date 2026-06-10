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

// Module-level cache: trending data persists across component mounts
// and is prefetched eagerly so the Explore tab loads instantly.
let _trendingCache: Article[] | null = null;
let _trendingPromise: Promise<void> | null = null;

function prefetchTrending(limit: number = 5): Promise<void> {
  if (_trendingPromise) return _trendingPromise;
  _trendingPromise = (async () => {
    try {
      const articles = await api.getTrending(limit);
      _trendingCache = articles;
    } catch {
      // Silently fail — the hook will retry on mount
    } finally {
      _trendingPromise = null;
    }
  })();
  return _trendingPromise;
}

// Kick off prefetch immediately when this module loads (app boot).
// By the time the user taps Explore, trending data is already ready.
prefetchTrending();

export function useTrending(limit: number = 5): UseTrendingReturn {
  const [trending, setTrending] = useState<Article[]>(_trendingCache || []);
  const [loading, setLoading] = useState(!_trendingCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If cache is already populated, use it immediately
    if (_trendingCache) {
      setTrending(_trendingCache);
      setLoading(false);
      return;
    }

    // Otherwise wait for the prefetch or fetch fresh
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // Wait for any in-flight prefetch first
        if (_trendingPromise) {
          await _trendingPromise;
        }
        // If prefetch populated the cache, use it
        if (_trendingCache) {
          if (!cancelled) {
            setTrending(_trendingCache);
            setLoading(false);
          }
          return;
        }
        // Fallback: fetch fresh
        const articles = await api.getTrending(limit);
        _trendingCache = articles;
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
