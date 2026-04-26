// ─────────────────────────────────────────────────────
//  models/Post.js
//
//  This matches your frontend post object exactly:
//  { id, username, text, likes, liked, comments, createdAt }
//
//  But now it's stored in MongoDB, not localStorage.
// ─────────────────────────────────────────────────────

const mongoose = require('mongoose');

// ── Comment sub-schema ────────────────────────────────
// Comments live inside each post document (embedded documents).
// This is a MongoDB pattern — no separate "comments" collection needed.
const commentSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text:     { type: String, required: true, maxlength: 300 },
  },
  { timestamps: true }
);

// ── Post schema ───────────────────────────────────────
const postSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,  // reference to User collection
      ref:      'User',
      required: true,
    },
    username: {
      type:     String,
      required: true,
    },
    text: {
      type:      String,
      required:  [true, 'Post text is required'],
      maxlength: [500, 'Post must be under 500 characters'],
      trim:      true,
    },
    likes: [
      {
        // Instead of a count, we store WHO liked it.
        // This lets us check if current user already liked it.
        type: mongoose.Schema.Types.ObjectId,
        ref:  'User',
      }
    ],
    comments: [commentSchema],   // array of embedded comment documents
    edited:   { type: Boolean, default: false },
  },
  {
    timestamps: true,   // gives us createdAt + updatedAt automatically
  }
);

module.exports = mongoose.model('Post', postSchema);
