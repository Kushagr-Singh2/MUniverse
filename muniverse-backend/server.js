// ─────────────────────────────────────────────────────
//  server.js  — the entry point of our whole backend
//
//  What happens here:
//  1. Load environment variables from .env
//  2. Connect to MongoDB
//  3. Create the Express app
//  4. Register all routes
//  5. Start listening on a port
// ─────────────────────────────────────────────────────

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
require('dotenv').config();          // loads .env into process.env

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ────────────────────────────────────────
// cors  → allows our frontend (different port) to talk to this server
// json  → lets Express read JSON request bodies automatically
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// ── ROUTES ────────────────────────────────────────────
// Every URL starting with /api/auth goes to authRoutes
// Every URL starting with /api/posts goes to postRoutes
app.use('/api/auth',  authRoutes);
app.use('/api/posts', postRoutes);

// ── HEALTH CHECK ─────────────────────────────────────
// Open http://localhost:5000/api/health in browser to test server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'MUniverse API is running 🚀' });
});

// ── CONNECT DB THEN START SERVER ──────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);   // stop the server if DB fails
  });
