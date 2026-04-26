const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already taken.' });
    const user  = await User.create({ username, password });
    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Fill in both fields.' });
    const user = await User.findOne({ username }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid username or password.' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password.' });
    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: { id: req.user._id, username: req.user.username } });
});

module.exports = router;