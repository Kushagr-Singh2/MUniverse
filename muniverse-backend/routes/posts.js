// ─────────────────────────────────────────────────────
//  routes/posts.js
//
//  GET    /api/posts          → get all posts (public)
//  POST   /api/posts          → create a post (login required)
//  PUT    /api/posts/:id      → edit a post (login + must be author)
//  DELETE /api/posts/:id      → delete a post (login + must be author)
//  PUT    /api/posts/:id/like → toggle like on a post (login required)
//  POST   /api/posts/:id/comments      → add a comment (login required)
//  DELETE /api/posts/:id/comments/:cid → delete a comment (login required)
// ─────────────────────────────────────────────────────

const express  = require('express');
const Post     = require('../models/Post');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────────────
//  GET /api/posts
//  Returns all posts, newest first.
//  Also tells the frontend if the current user liked each post.
// ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })   // newest first, same as your frontend sort
      .lean();                   // .lean() returns plain JS objects (faster)

    // We need to know which user is making this request (if any)
    // to tell the frontend if they liked each post.
    // We check the token optionally — guests can still read posts.
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (_) { /* token invalid, treat as guest */ }
    }

    // Shape the data to match what your frontend expects
    const shaped = posts.map(post => ({
      id:        post._id,
      username:  post.username,
      text:      post.text,
      likes:     post.likes.length,             // send count, not array
      liked:     currentUserId
                   ? post.likes.map(String).includes(String(currentUserId))
                   : false,
      comments:  post.comments.map(c => ({
        id:       c._id,
        username: c.username,
        text:     c.text,
        time:     new Date(c.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:true }),
      })),
      createdAt: post.createdAt.getTime(),
      edited:    post.edited,
    }));

    res.json(shaped);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch posts.' });
  }
});

// ─────────────────────────────────────────────────────
//  POST /api/posts
//  Body: { text }
//  Creates a new post. Requires login.
// ─────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Post text cannot be empty.' });
    }

    const post = await Post.create({
      user:     req.user._id,
      username: req.user.username,
      text:     text.trim(),
    });

    // send back the same shape as GET /api/posts
    res.status(201).json({
      id:        post._id,
      username:  post.username,
      text:      post.text,
      likes:     0,
      liked:     false,
      comments:  [],
      createdAt: post.createdAt.getTime(),
      edited:    false,
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not create post.' });
  }
});

// ─────────────────────────────────────────────────────
//  PUT /api/posts/:id
//  Body: { text }
//  Edit a post. Only the author can do this.
// ─────────────────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // check ownership
    if (String(post.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own posts.' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Post text cannot be empty.' });
    }

    post.text   = text.trim();
    post.edited = true;
    await post.save();

    res.json({ message: 'Post updated.', text: post.text, edited: true });
  } catch (err) {
    res.status(500).json({ message: 'Could not update post.' });
  }
});

// ─────────────────────────────────────────────────────
//  DELETE /api/posts/:id
//  Delete a post. Only the author can do this.
// ─────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (String(post.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete post.' });
  }
});

// ─────────────────────────────────────────────────────
//  PUT /api/posts/:id/like
//  Toggle like/unlike on a post.
// ─────────────────────────────────────────────────────
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const userId    = String(req.user._id);
    const likeIndex = post.likes.map(String).indexOf(userId);
    const isLiked   = likeIndex > -1;

    if (isLiked) {
      // already liked → unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // not liked → like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      likes: post.likes.length,
      liked: !isLiked,
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not toggle like.' });
  }
});

// ─────────────────────────────────────────────────────
//  POST /api/posts/:id/comments
//  Body: { text }
//  Add a comment to a post.
// ─────────────────────────────────────────────────────
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    post.comments.push({
      user:     req.user._id,
      username: req.user.username,
      text:     text.trim(),
    });

    await post.save();

    // return the newly added comment
    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json({
      id:       newComment._id,
      username: newComment.username,
      text:     newComment.text,
      time:     new Date(newComment.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:true }),
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not add comment.' });
  }
});

// ─────────────────────────────────────────────────────
//  DELETE /api/posts/:id/comments/:commentId
//  Delete a comment. Only the comment author can do this.
// ─────────────────────────────────────────────────────
router.delete('/:id/comments/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    if (String(comment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own comments.' });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete comment.' });
  }
});

module.exports = router;
