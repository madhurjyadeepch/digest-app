const mongoose = require("mongoose");

const userPreferencesSchema = new mongoose.Schema({
  _id: { type: String }, // Firebase UID

  categories: { type: [String], default: [] },
  notifications: { type: Boolean, default: true },
  language: { type: String, default: "en" },
  country: { type: String, default: "us" },

  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserPreference", userPreferencesSchema);
