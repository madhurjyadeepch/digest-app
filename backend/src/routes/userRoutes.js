const express = require('express');
const router = express.Router();
const { getDb, isFirebaseAvailable } = require('../config/firebase');

const COLLECTION_BOOKMARKS = 'user_bookmarks';

/**
 * Middleware to check Firebase availability for user routes.
 */
function requireFirebase(req, res, next) {
  if (!isFirebaseAvailable()) {
    return res.status(503).json({
      success: false,
      error: 'Firebase not configured — user features unavailable',
    });
  }
  next();
}

/**
 * POST /api/user/bookmarks
 * Save a bookmark.
 *
 * Body: { userId, article }
 */
router.post('/bookmarks', requireFirebase, async (req, res, next) => {
  try {
    const { userId, article } = req.body;

    if (!userId || !article || !article.id) {
      return res.status(400).json({
        success: false,
        error: 'userId and article (with id) are required',
      });
    }

    const db = getDb();
    const docId = `${userId}_${article.id}`;

    await db
      .collection(COLLECTION_BOOKMARKS)
      .doc(docId)
      .set({
        userId,
        articleId: article.id,
        article,
        savedAt: new Date(),
      });

    res.status(201).json({
      success: true,
      message: 'Bookmark saved',
      data: { bookmarkId: docId },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/user/bookmarks
 * Get all bookmarks for a user.
 *
 * Query params:
 *   userId - User ID (required)
 */
router.get('/bookmarks', requireFirebase, async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required',
      });
    }

    const db = getDb();
    const snapshot = await db
      .collection(COLLECTION_BOOKMARKS)
      .where('userId', '==', userId)
      .orderBy('savedAt', 'desc')
      .get();

    const bookmarks = snapshot.docs.map((doc) => ({
      bookmarkId: doc.id,
      ...doc.data().article,
      savedAt: doc.data().savedAt,
    }));

    res.json({
      success: true,
      data: bookmarks,
      meta: { total: bookmarks.length },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/user/bookmarks/:bookmarkId
 * Remove a bookmark.
 */
router.delete('/bookmarks/:bookmarkId', requireFirebase, async (req, res, next) => {
  try {
    const { bookmarkId } = req.params;

    const db = getDb();
    const docRef = db.collection(COLLECTION_BOOKMARKS).doc(bookmarkId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Bookmark not found',
      });
    }

    await docRef.delete();

    res.json({
      success: true,
      message: 'Bookmark removed',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/user/preferences
 * Get user preferences.
 *
 * Query params:
 *   userId - User ID (required)
 */
router.get('/preferences', requireFirebase, async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required',
      });
    }

    const db = getDb();
    const doc = await db.collection('user_preferences').doc(userId).get();

    if (!doc.exists) {
      // Return default preferences
      return res.json({
        success: true,
        data: {
          categories: [],
          notifications: true,
          language: 'en',
          country: 'us',
        },
      });
    }

    res.json({
      success: true,
      data: doc.data(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/user/preferences
 * Update user preferences.
 *
 * Body: { userId, preferences }
 */
router.put('/preferences', requireFirebase, async (req, res, next) => {
  try {
    const { userId, preferences } = req.body;

    if (!userId || !preferences) {
      return res.status(400).json({
        success: false,
        error: 'userId and preferences are required',
      });
    }

    const db = getDb();
    await db
      .collection('user_preferences')
      .doc(userId)
      .set(
        {
          ...preferences,
          updatedAt: new Date(),
        },
        { merge: true }
      );

    res.json({
      success: true,
      message: 'Preferences updated',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
