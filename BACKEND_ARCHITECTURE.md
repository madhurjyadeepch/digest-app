# Digest Backend Architecture & Workflow

This document provides a complete technical breakdown of how the Digest app backend currently operates. 

The backend is a **Node.js + Express** application (`src/index.js`) designed for high performance, utilizing a multi-tiered caching strategy, multiple external APIs for fallback reliability, and Firebase for user data management.

---

## 1. Server Startup (`src/index.js`)

When you run `npm run start` or `npm run dev`, the server initializes in `src/index.js`. 
- **Network Binding**: It binds to `0.0.0.0` (all network interfaces) instead of just `localhost`. This is crucial because it allows your mobile app (running on a physical phone or emulator on the same Wi-Fi network) to communicate with the backend.
- **Middleware**: It uses `cors()` for cross-origin requests and `express.json()` to parse incoming JSON bodies.
- **Background Jobs**: It immediately kicks off the `startCacheRefreshJob()` to "warm up" the news cache so the first user request is instant.

---

## 2. API Routes

The backend handles requests across four main routers:

1. **News Routes** (`/api/news`): Handles fetching the main feed, specific categories, searching, and trending articles. It delegates all heavy lifting to the `newsAggregator`.
2. **User Routes** (`/api/user`): Handles saving/removing bookmarks and getting/setting user preferences. Data is stored in Firebase Firestore.
3. **Auth Routes** (`/api/auth`): Handles creating the Firestore user profile (after the app registers via Firebase Auth), retrieving the profile, and deleting the account entirely.
4. **Chat Routes** (`/api/chat`): Handles requests to the AI Chatbot using the OpenRouter API.

---

## 3. The News Aggregator (`src/services/newsAggregator.js`)

This is the brain of the app. Because external News APIs have rate limits, can be slow, or might go down, the aggregator uses a **Priority Chain Strategy**.

### Fetch Priority
When the app requests news, the aggregator tries APIs in this exact order:
1. **World News API (Primary)**: Provides full article text, authors, and sentiment analysis. Crucially, it fetches India-specific news mixed with Global news.
2. **GNews (Fallback 1)**: Used if World News API fails.
3. **Currents API (Fallback 2)**: Used if GNews also fails.
4. **Firestore Cache (Last Resort)**: If all external APIs are exhausted, it serves the last successfully fetched news from the database.

### The "Article Pool"
To support infinite scrolling without hammering APIs, the aggregator maintains an **In-Memory Map** (`this._articlePool`). Whenever it fetches news from anywhere, it dumps the articles into this pool, deduplicating them by ID. When the user scrolls, the app simply paginates over this pool.

---

## 4. Multi-Tier Caching System

To make the app feel incredibly fast (under 50ms response times), the backend uses a sophisticated caching layer.

1. **In-Memory Cache (`src/services/memoryCache.js`)**: 
   - Node.js memory. Fetching from here takes `<1ms`. 
   - When a user opens the app, the backend almost exclusively serves news from this memory cache.
2. **Firestore Cache (`src/services/cacheService.js`)**: 
   - Acts as persistent backup. When the memory cache updates, it quietly syncs a copy to Firestore in the background.

### The Cron Job (`src/jobs/refreshCache.js`)
To ensure the memory cache is never empty and the news is always fresh, a background task (`node-cron`) runs **every 30 minutes**. 
It goes out to the APIs, fetches India news, global news, and all categories, maps them, and updates the in-memory cache—all silently in the background without making the user wait.

---

## 5. Data Normalization (`src/utils/mappers.js`)

Different News APIs return data in wildly different formats (different keys, weird truncation tags, missing authors). 

The mappers sit between the external APIs and your app. They take raw data from GNews, Currents, or World News, and force them into a single, clean `Article` object shape that the frontend expects.
- **`guessCategory()`**: If an API doesn't provide a category, this function scans the title/description for keywords (e.g., "AI", "Stock") to assign one.
- **`estimateReadTime()`**: Calculates reading time based on word count (assuming 200 words/minute).
- **`buildFullContent()`**: Cleans up the text, removes "Subscribe to read more" artifacts, and formats the text into paragraphs, quotes, and headings.

---

## 6. AI Chat Engine (`src/routes/chatRoutes.js`)

The chat endpoint `/api/chat` handles the AI features of the app using OpenRouter.

- **System Prompting**: It injects the specific article's title, category, and up to 3000 characters of its content directly into the invisible system prompt so the AI knows exactly what the user is reading.
- **Model Fallback**: It attempts to use `nvidia/nemotron-3-super-120b`, but if that model is busy or errors out, it automatically falls back to `gemma-4-31b`, `trinity`, or `llama` (all free-tier models).
- **Thinking Scrubbing**: Some free models expose their internal "reasoning" (like `<think>...</think>`). The backend runs a regex cleaner (`cleanThinkingOutput`) to strip out these artifacts so the user only sees the final answer.
- **Relevance Guardrail**: The prompt instructs the AI to respond with `[OFF_TOPIC]` if the user asks something unrelated to the article. The backend detects this flag to handle off-topic rejections gracefully.

---

## 7. Authentication & Database (`src/config/firebase.js` & `src/middleware/auth.js`)

- **Auth**: When the mobile app makes a request to a protected route (like `GET /api/auth/profile`), it sends a Firebase JWT token in the headers. The `authMiddleware` uses `firebase-admin` to verify this token cryptographically. If valid, it attaches the user's `uid` to the request.
- **Database**: The backend uses Firestore for user data:
  - `users` collection: Profile info, settings, bookmark counts.
  - `user_bookmarks` collection: Stores the actual bookmarked articles.
  - `user_preferences` collection: Stores category/notification preferences.

## Summary Flow of a App Request

1. App asks for `/api/news?category=technology`.
2. Router hits `NewsAggregator.getArticles()`.
3. Aggregator checks Memory Cache. If found, returns in 1ms.
4. If not found, Aggregator fetches from World News API.
5. `mappers.js` cleans the World News API response.
6. Aggregator saves the clean data to Memory Cache and Firestore Cache.
7. Backend responds to the App with a paginated list of `Article` objects.
