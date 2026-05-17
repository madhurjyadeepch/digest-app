# Digest App API Endpoints

This document outlines all the REST API endpoints currently exposed by the backend and consumed by the Digest frontend app. 

Base URL (Development): `http://<LAN_IP>:3001/api`

## Health Check

### `GET /api/health`
Checks if the backend server is running.
- **Response**: `{ status: 'ok', timestamp: '...', uptime: ... }`

---

## News (`/api/news`)

### `GET /api/news/`
Fetches a paginated feed of news articles.
- **Query Parameters**:
  - `category` (optional): Filter by category (e.g., `technology`, `business`)
  - `page` (optional): Page number (default: `1`)
  - `limit` (optional): Articles per page (default: `10`)

### `GET /api/news/trending`
Fetches top trending articles across all categories.
- **Query Parameters**:
  - `limit` (optional): Number of articles (default: `5`)

### `GET /api/news/search`
Searches articles by keyword.
- **Query Parameters**:
  - `q` (required): Search query string
  - `limit` (optional): Max results (default: `10`)

### `GET /api/news/categories`
Lists all available news categories supported by the app.
- **Response**: Array of category strings.

### `GET /api/news/:id`
Fetches a single article by its ID.
- **URL Parameters**:
  - `id`: The article's unique identifier.

---

## User (`/api/user`)
*Note: These routes require Firebase to be configured.*

### `POST /api/user/bookmarks`
Saves an article to the user's bookmarks.
- **Request Body**:
  ```json
  {
    "userId": "string",
    "article": { /* Article Object containing at least 'id' */ }
  }
  ```

### `GET /api/user/bookmarks`
Retrieves all bookmarked articles for a user.
- **Query Parameters**:
  - `userId` (required): The user's ID.

### `DELETE /api/user/bookmarks/:bookmarkId`
Removes a specific bookmark.
- **URL Parameters**:
  - `bookmarkId`: The unique document ID of the bookmark (`userId_articleId`).

### `GET /api/user/preferences`
Retrieves user preferences.
- **Query Parameters**:
  - `userId` (required): The user's ID.

### `PUT /api/user/preferences`
Updates user preferences.
- **Request Body**:
  ```json
  {
    "userId": "string",
    "preferences": { /* Updated preferences object */ }
  }
  ```

---

## Auth (`/api/auth`)
*Note: All routes except `/register` require a valid Bearer token in the `Authorization` header (`Authorization: Bearer <token>`).*

### `POST /api/auth/register`
Creates a user profile in Firestore after client-side Firebase registration.
- **Request Body**:
  ```json
  {
    "uid": "string",
    "email": "string",
    "displayName": "string (optional)"
  }
  ```

### `GET /api/auth/profile`
Gets the authenticated user's profile.
- **Headers**: `Authorization: Bearer <token>`

### `PUT /api/auth/profile`
Updates the authenticated user's profile.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "displayName": "string (optional)",
    "preferences": { /* Preferences object (optional) */ }
  }
  ```

### `DELETE /api/auth/account`
Deletes the authenticated user's account, profile, preferences, and bookmarks.
- **Headers**: `Authorization: Bearer <token>`

---

## Chat (`/api/chat`)

### `POST /api/chat/`
Sends a question about an article to the AI assistant.
- **Request Body**:
  ```json
  {
    "question": "string (required)",
    "articleTitle": "string (optional)",
    "articleContent": "string (optional)",
    "articleCategory": "string (optional)",
    "chatHistory": [
      { "role": "user", "content": "..." },
      { "role": "assistant", "content": "..." }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "answer": "string",
      "isRelevant": boolean
    }
  }
  ```
