# Digest App — MongoDB Schemas

This document defines the MongoDB collections and schemas you need to rebuild the backend with MongoDB (using Mongoose).

---

## 1. `users` Collection

Stores user profiles created after Firebase Auth registration.

```js
const userSchema = new mongoose.Schema({
  // Use Firebase UID as the primary key
  _id: { type: String },                     // Firebase UID (e.g., "abc123xyz")

  email:        { type: String, required: true, unique: true },
  displayName:  { type: String, default: '' },

  preferences: {
    categories:    { type: [String], default: [] },     // e.g., ["technology", "science"]
    notifications: { type: Boolean,  default: true },
    language:      { type: String,   default: 'en' },
    country:       { type: String,   default: 'us' },
  },

  bookmarkCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

### Example Document
```json
{
  "_id": "firebase_uid_abc123",
  "email": "madhurjya@gmail.com",
  "displayName": "Madhurjya",
  "preferences": {
    "categories": ["technology", "science"],
    "notifications": true,
    "language": "en",
    "country": "us"
  },
  "bookmarkCount": 3,
  "createdAt": "2026-05-15T12:00:00Z",
  "updatedAt": "2026-05-15T12:00:00Z"
}
```

### Indexes
- `email` — unique index (already enforced by `unique: true`)

---

## 2. `bookmarks` Collection

Stores bookmarked articles per user.

```js
const bookmarkSchema = new mongoose.Schema({
  // Composite key: <userId>_<articleId>  (prevents duplicate bookmarks)
  _id: { type: String },                     // e.g., "firebase_uid_abc123_a1b2c3d4e5f6"

  userId:    { type: String, required: true, index: true },
  articleId: { type: String, required: true },

  // Embedded article snapshot (denormalized for fast reads)
  article: {
    id:            { type: String, required: true },
    category:      { type: String },
    categoryColor: { type: String, enum: ['primary', 'secondary', 'tertiary', 'error'] },
    title:         { type: String, required: true },
    summary:       { type: String },
    dominantColor: { type: String },
    fullContent:   [{
      type:    { type: String, enum: ['paragraph', 'heading', 'quote', 'image'] },
      content: { type: String },
      caption: { type: String },
    }],
    author: {
      name:   { type: String },
      role:   { type: String },
      avatar: { type: String },
    },
    readTime:      { type: String },
    imageUrl:      { type: String },
    sourceUrl:     { type: String },
    publishedAt:   { type: String },
    source:        { type: String },
    sentiment:     { type: Number },          // -1 to 1
    sourceCountry: { type: String },
    authors:       { type: [String] },
    videoUrl:      { type: String },
  },

  savedAt: { type: Date, default: Date.now },
});
```

### Example Document
```json
{
  "_id": "firebase_uid_abc123_a1b2c3d4e5f6",
  "userId": "firebase_uid_abc123",
  "articleId": "a1b2c3d4e5f6",
  "article": {
    "id": "a1b2c3d4e5f6",
    "category": "Technology",
    "categoryColor": "primary",
    "title": "AI Breakthrough in 2026",
    "summary": "Researchers have achieved a major milestone...",
    "dominantColor": "#1a3a5c",
    "fullContent": [
      { "type": "paragraph", "content": "Researchers at MIT have..." },
      { "type": "heading", "content": "What This Means" },
      { "type": "paragraph", "content": "The implications are..." }
    ],
    "author": {
      "name": "John Doe",
      "role": "Correspondent",
      "avatar": "https://i.pravatar.cc/100?img=5"
    },
    "readTime": "4 Min Read",
    "imageUrl": "https://example.com/image.jpg",
    "sourceUrl": "https://example.com/article",
    "publishedAt": "2026-05-15T10:00:00Z",
    "source": "TechCrunch",
    "sentiment": 0.8,
    "sourceCountry": "us",
    "authors": ["John Doe"],
    "videoUrl": null
  },
  "savedAt": "2026-05-15T12:30:00Z"
}
```

### Indexes
- `userId` — for fetching all bookmarks by user
- Compound `{ userId: 1, savedAt: -1 }` — for sorted bookmark queries

---

## 3. `user_preferences` Collection

> **Optional — can be merged into the `users` collection** (it already has a `preferences` sub-document). The current Firebase backend uses a separate collection, so this schema is included if you want to keep them separate.

```js
const userPreferencesSchema = new mongoose.Schema({
  _id: { type: String },                     // Firebase UID

  categories:    { type: [String], default: [] },
  notifications: { type: Boolean,  default: true },
  language:      { type: String,   default: 'en' },
  country:       { type: String,   default: 'us' },

  updatedAt: { type: Date, default: Date.now },
});
```

### Example Document
```json
{
  "_id": "firebase_uid_abc123",
  "categories": ["technology", "science", "business"],
  "notifications": true,
  "language": "en",
  "country": "in",
  "updatedAt": "2026-05-15T14:00:00Z"
}
```

---

## 4. `articles` Collection (Cache — Optional)

If you want to cache fetched news articles in MongoDB instead of in-memory, use this schema. This maps directly to the `Article` type used by the frontend.

```js
const articleSchema = new mongoose.Schema({
  _id: { type: String },                     // MD5 hash of source URL (12 chars)

  category:      { type: String, required: true },
  categoryColor: { type: String, enum: ['primary', 'secondary', 'tertiary', 'error'] },
  title:         { type: String, required: true },
  summary:       { type: String },
  dominantColor: { type: String },

  fullContent: [{
    type:    { type: String, enum: ['paragraph', 'heading', 'quote', 'image'] },
    content: { type: String },
    caption: { type: String },
  }],

  author: {
    name:   { type: String, default: 'Staff Reporter' },
    role:   { type: String, default: 'Correspondent' },
    avatar: { type: String },
  },

  readTime:      { type: String },
  imageUrl:      { type: String },
  sourceUrl:     { type: String },
  publishedAt:   { type: String },
  source:        { type: String },

  // World News API enrichments
  sentiment:     { type: Number },            // -1 to 1
  sourceCountry: { type: String },
  authors:       { type: [String] },
  videoUrl:      { type: String },

  // Cache metadata
  fetchedAt:  { type: Date, default: Date.now },
  expiresAt:  { type: Date },                 // TTL for auto-cleanup
}, {
  timestamps: true,
});

// TTL index — auto-delete cached articles after expiry
articleSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### Indexes
- `category` — for category-filtered queries
- `publishedAt` — for sorting by recency
- `{ expiresAt: 1 }` — TTL index for automatic cache expiry
- Text index on `{ title: 'text', summary: 'text' }` — for search

---

## Summary Table

| Collection | Doc ID | Purpose | Key Fields |
|---|---|---|---|
| `users` | Firebase UID | User profiles & auth | `email`, `displayName`, `preferences`, `bookmarkCount` |
| `bookmarks` | `<userId>_<articleId>` | Saved articles | `userId`, `articleId`, `article` (embedded), `savedAt` |
| `user_preferences` | Firebase UID | User settings (optional, can merge with `users`) | `categories`, `notifications`, `language`, `country` |
| `articles` | MD5 hash of URL | Cached news articles (optional) | `title`, `category`, `fullContent`, `author`, `publishedAt` |

---

## Recommended Mongoose Connection Setup

```js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'digest',
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});
```

### `.env` Variable
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/digest?retryWrites=true&w=majority
```
