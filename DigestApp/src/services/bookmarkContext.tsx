import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from './api';
import { Article } from '../types';

// ─── Types ──────────────────────────────────────────
interface BookmarkEntry extends Article {
  bookmarkId?: string;  // Firestore doc ID for deletion
}

interface BookmarkContextType {
  bookmarks: BookmarkEntry[];
  loading: boolean;
  error: string | null;
  isBookmarked: (articleId: string) => boolean;
  saveBookmark: (article: Article) => Promise<void>;
  removeBookmark: (articleId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────
export function BookmarkProvider({
  userId,
  children,
}: {
  userId: string | undefined;
  children: React.ReactNode;
}) {
  const uid = userId || 'local_user';
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard against duplicate save calls in flight
  const savingIdsRef = useRef<Set<string>>(new Set());

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getBookmarks(uid);
      setBookmarks(data);
    } catch (err: any) {
      if (!err.message?.includes('500') && !err.message?.includes('503')) {
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

  /**
   * Save-only: does nothing if article is already bookmarked.
   * Guards against rapid multi-taps with an in-flight set.
   */
  const saveBookmarkFn = useCallback(
    async (article: Article) => {
      // Already saved or currently saving → no-op
      if (bookmarks.some((b) => b.id === article.id)) return;
      if (savingIdsRef.current.has(article.id)) return;

      savingIdsRef.current.add(article.id);

      // Optimistic add with the expected bookmarkId
      const entry: BookmarkEntry = {
        ...article,
        bookmarkId: `${uid}_${article.id}`,
      };
      setBookmarks((prev) => {
        // Double-check no duplicate slipped in
        if (prev.some((b) => b.id === article.id)) return prev;
        return [entry, ...prev];
      });

      try {
        await api.saveBookmark(uid, article);
      } catch (err) {
        // Revert on failure
        setBookmarks((prev) => prev.filter((b) => b.id !== article.id));
        console.error('[BookmarkContext] Save failed:', err);
      } finally {
        savingIdsRef.current.delete(article.id);
      }
    },
    [uid, bookmarks]
  );

  /**
   * Remove a bookmark by article ID. Uses the stored bookmarkId
   * (Firestore doc ID) for the API call.
   */
  const removeBookmarkFn = useCallback(
    async (articleId: string) => {
      const existing = bookmarks.find((b) => b.id === articleId);
      if (!existing) return;

      // Use the stored bookmarkId, or construct it from userId_articleId
      const bookmarkId = existing.bookmarkId || `${uid}_${articleId}`;

      // Optimistic remove
      setBookmarks((prev) => prev.filter((b) => b.id !== articleId));

      try {
        await api.removeBookmark(bookmarkId);
      } catch (err) {
        // Revert on failure
        setBookmarks((prev) => [existing, ...prev]);
        console.error('[BookmarkContext] Remove failed:', err);
      }
    },
    [uid, bookmarks]
  );

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        loading,
        error,
        isBookmarked,
        saveBookmark: saveBookmarkFn,
        removeBookmark: removeBookmarkFn,
        refresh: fetchBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────
export function useSharedBookmarks(): BookmarkContextType {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useSharedBookmarks must be used within a BookmarkProvider');
  }
  return context;
}
