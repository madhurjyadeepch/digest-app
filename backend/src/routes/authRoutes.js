const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { getDb, isFirebaseAvailable } = require('../config/firebase');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user with email/password via Firebase Auth.
 * Note: In a mobile app, registration usually happens client-side
 * with Firebase SDK. This endpoint is for creating the Firestore
 * user profile after client-side registration.
 *
 * Body: { uid, email, displayName }
 */
router.post('/register', async (req, res, next) => {
  if (!isFirebaseAvailable()) {
    return res.status(503).json({
      success: false,
      error: 'Firebase not configured',
    });
  }

  try {
    const { uid, email, displayName } = req.body;

    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        error: 'uid and email are required',
      });
    }

    const db = getDb();

    // Create user profile in Firestore
    await db
      .collection('users')
      .doc(uid)
      .set({
        email,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date(),
        preferences: {
          categories: [],
          notifications: true,
          language: 'en',
          country: 'us',
        },
        bookmarkCount: 0,
      });

    res.status(201).json({
      success: true,
      message: 'User profile created',
      data: {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/profile
 * Get the authenticated user's profile.
 * Requires: Bearer token in Authorization header.
 */
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const doc = await db.collection('users').doc(req.user.uid).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found',
      });
    }

    res.json({
      success: true,
      data: {
        uid: req.user.uid,
        ...doc.data(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/profile
 * Update the authenticated user's profile.
 * Requires: Bearer token in Authorization header.
 *
 * Body: { displayName?, preferences? }
 */
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { displayName, preferences } = req.body;
    const updates = { updatedAt: new Date() };

    if (displayName) updates.displayName = displayName;
    if (preferences) updates.preferences = preferences;

    const db = getDb();
    await db
      .collection('users')
      .doc(req.user.uid)
      .set(updates, { merge: true });

    res.json({
      success: true,
      message: 'Profile updated',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/auth/account
 * Delete the authenticated user's account and all associated data.
 * Requires: Bearer token in Authorization header.
 */
router.delete('/account', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const uid = req.user.uid;

    // Delete user's bookmarks
    const bookmarksSnapshot = await db
      .collection('user_bookmarks')
      .where('userId', '==', uid)
      .get();

    const batch = db.batch();
    bookmarksSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    // Delete user preferences
    batch.delete(db.collection('user_preferences').doc(uid));

    // Delete user profile
    batch.delete(db.collection('users').doc(uid));

    await batch.commit();

    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);

    res.json({
      success: true,
      message: 'Account and all associated data deleted',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
