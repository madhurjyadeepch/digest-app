const admin = require('firebase-admin');
const { isFirebaseAvailable } = require('../config/firebase');

/**
 * Firebase Auth Middleware
 * Verifies the Firebase ID token from the Authorization header.
 * Attaches the decoded user to req.user.
 *
 * Usage: router.get('/protected', authMiddleware, handler)
 */
async function authMiddleware(req, res, next) {
  if (!isFirebaseAvailable()) {
    return res.status(503).json({
      success: false,
      error: 'Authentication service unavailable — Firebase not configured',
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing or invalid Authorization header. Expected: Bearer <token>',
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      picture: decodedToken.picture || null,
    };
    next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired — please re-authenticate',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token',
    });
  }
}

/**
 * Optional auth middleware — continues even if no token is provided.
 * Useful for routes that work both authenticated and anonymously.
 */
async function optionalAuth(req, _res, next) {
  if (!isFirebaseAvailable()) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      picture: decodedToken.picture || null,
    };
  } catch {
    // Silently continue without auth
  }

  next();
}

module.exports = { authMiddleware, optionalAuth };
