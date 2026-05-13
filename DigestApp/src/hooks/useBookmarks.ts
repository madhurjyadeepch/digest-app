import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Article } from '../types';

// Default user ID for local dev (no auth yet)
const DEFAULT_USER_ID = 'local_user';

interface UseBookmarksReturn {
  bookmarks: Article[];
  loading: boolean;
  error: string | null;
  isBookmarked: (articleId: string) => boolean;
  toggleBookmark: (article: Article) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for managing bookmarks with optimistic updates.
 */
export function useBookmarks(userId?: string): UseBookmarksReturn {
  const uid = userId || DEFAULT_USER_ID;
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getBookmarks(uid);
      setBookmarks(data);
    } catch (err: any) {
      // Don't show error for empty bookmarks or Firebase not configured
      if (!err.message?.includes('503')) {
        setError(err.message || 'Failed to fetch bookmarks');
      }
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = useCallback(
    (articleId: string) => {
      return bookmarks.some((b) => b.id === articleId);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (article: Article) => {
      const alreadySaved = isBookmarked(article.id);

      if (alreadySaved) {
        // Optimistic remove
        setBookmarks((prev) => prev.filter((b) => b.id !== article.id));

        try {
          const bookmarkId = `${uid}_${article.id}`;
          await api.removeBookmark(bookmarkId);
        } catch (err) {
          // Revert on failure
          setBookmarks((prev) => [...prev, article]);
          console.error('[useBookmarks] Remove failed:', err);
        }
      } else {
        // Optimistic add
        setBookmarks((prev) => [article, ...prev]);

        try {
          await api.saveBookmark(uid, article);
        } catch (err) {
          // Revert on failure
          setBookmarks((prev) => prev.filter((b) => b.id !== article.id));
          console.error('[useBookmarks] Save failed:', err);
        }
      }
    },
    [uid, isBookmarked]
  );

  return {
    bookmarks,
    loading,
    error,
    isBookmarked,
    toggleBookmark,
    refresh: fetchBookmarks,
  };
}
