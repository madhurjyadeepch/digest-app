const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    _id: { type: String }, // MD5 hash of source URL (12 chars)

    category: { type: String, required: true },
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
      name: { type: String, default: "Staff Reporter" },
      role: { type: String, default: "Correspondent" },
      avatar: { type: String },
    },

    readTime: { type: String },
    imageUrl: { type: String },
    sourceUrl: { type: String },
    publishedAt: { type: String },
    source: { type: String },

    // World News API enrichments
    sentiment: { type: Number }, // -1 to 1
    sourceCountry: { type: String },
    authors: { type: [String] },
    videoUrl: { type: String },

    // Cache metadata
    fetchedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }, // TTL for auto-cleanup
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// === Indexes ===

// TTL index — auto-delete cached articles after expiry
articleSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// For category-filtered queries
articleSchema.index({ category: 1 });

// For sorting by recency
articleSchema.index({ publishedAt: -1 });

// Text index for search functionality
articleSchema.index({ title: "text", summary: "text" });

module.exports = mongoose.model("Article", articleSchema);
