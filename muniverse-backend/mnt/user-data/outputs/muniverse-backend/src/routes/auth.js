// ─────────────────────────────────────────────────────
//  routes/auth.js
//
//  POST /api/auth/register  → create new account
//  POST /api/auth/login     → login, get back a token
//  GET  /api/auth/me        → get current user info (needs token)
// ─────────────────────────────────────────────────────

const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Helper: create a signed JWT token ────────────────
function generateToken(userId) {
  return jwt.sign(
    { id: userId },           // payload — what we store inside the token
    process.env.JWT_SECRET,   // secret key to sign it
    { expiresIn: process.env.JWT_EXPIRE }  // how long until it expires
  );
}

// ─────────────────────────────────────────────────────
//  POST /api/auth/register
//  Body: { username, password }
// ─────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // check if username already taken
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username already taken. Try another.' });
    }

    // create user — password gets hashed automatically by our model's pre-save hook
    const user = await User.create({ username, password });

    // send back a token so they're immediately logged in after registering
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: user._id, username: user.username },
    });

  } catch (err) {
    // handle mongoose validation errors nicely
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────
//  POST /api/auth/login
//  Body: { username, password }
// ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter username and password.' });
    }

    // we need the password for comparison, but it's select:false by default
    // so we explicitly request it with .select('+password')
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Logged in!',
      token,
      user: { id: user._id, username: user.username },
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────
//  GET /api/auth/me
//  Returns current logged-in user (requires token)
// ─────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ user: { id: req.user._id, username: req.user.username } });
});

module.exports = router;
