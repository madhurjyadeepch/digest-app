const admin = require('firebase-admin');
const path = require('path');

let db = null;
let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK.
 * Falls back gracefully if credentials are missing (allows API-only mode).
 */
function initializeFirebase() {
  if (firebaseInitialized) return db;

  try {
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
    const resolvedPath = path.resolve(serviceAccountPath);

    // Try loading service account
    const serviceAccount = require(resolvedPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    });

    db = admin.firestore();
    firebaseInitialized = true;
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.warn(
      '⚠️  Firebase not initialized — running in API-only mode (no caching/auth)'
    );
    console.warn(`   Reason: ${error.message}`);
    console.warn(
      '   To enable Firebase, add serviceAccountKey.json and update .env\n'
    );
    firebaseInitialized = true; // Mark as attempted so we don't retry
  }

  return db;
}

/**
 * Get Firestore database instance.
 * Returns null if Firebase is not configured.
 */
function getDb() {
  if (!firebaseInitialized) {
    initializeFirebase();
  }
  return db;
}

/**
 * Check if Firebase is available.
 */
function isFirebaseAvailable() {
  return db !== null;
}

module.exports = { initializeFirebase, getDb, isFirebaseAvailable };
