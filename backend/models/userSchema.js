const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: [true, "Password is required."],
    minlength: 8,
    select: false,
  },

  displayName: {
    type: String,
    default: "",
    trim: true,
  },

  preferences: {
    categories: { type: [String], default: [] },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: "en" },
    country: { type: String, default: "us" },
  },

  bookmarkCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  this.password = await bcrypt.hash(this.password, 12);
  next;
});

// ─── Instance method: verify password ────────────────────────────────────────
userSchema.methods.correctPassword = async function (
  candidatePassword,
  hashedPassword
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
