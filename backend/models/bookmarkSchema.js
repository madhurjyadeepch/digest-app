const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema({
  // Composite key: <userId>_<articleId>  (prevents duplicate bookmarks)
  _id: { type: String }, // e.g., "firebase_uid_abc123_a1b2c3d4e5f6"

  userId: { type: String, required: true, index: true },
  articleId: { type: String, required: true },

  // Embedded article snapshot (denormalized for fast reads)
  article: {
    id: { type: String, required: true },
    category: { type: String },
    categoryColor: {
      type: String,
      enum: ["primary", "secondary", "tertiary", "error"],
    },
    title: { type: String, required: true },
    summary: { type: String },
    dominantColor: { type: String },
    fullContent: [
      {
        type: {
          type: String,
          enum: ["paragraph", "heading", "quote", "image"],
        },
        content: { type: String },
        caption: { type: String },
      },
    ],
    author: {
      name: { type: String },
      role: { type: String },
      avatar: { type: String },
    },
    readTime: { type: String },
    imageUrl: { type: String },
    sourceUrl: { type: String },
    publishedAt: { type: String },
    source: { type: String },
    sentiment: { type: Number }, // -1 to 1
    sourceCountry: { type: String },
    authors: { type: [String] },
    videoUrl: { type: String },
  },

  savedAt: { type: Date, default: Date.now },
});

// Compound index for fetching user's bookmarks sorted by newest first
bookmarkSchema.index({ userId: 1, savedAt: -1 });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
