// ─────────────────────────────────────────────────────
//  models/User.js
//
//  A "model" is the blueprint for how data is stored in MongoDB.
//  Think of it like defining a table in SQL, but it's a "collection" here.
//
//  Mongoose turns this schema into real MongoDB documents.
// ─────────────────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type:     String,
      required: [true, 'Username is required'],
      unique:   true,                   // no two users can have same username
      trim:     true,                   // removes accidental spaces
      minlength: [3,  'Username must be at least 3 characters'],
      maxlength: [20, 'Username must be under 20 characters'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false,  // IMPORTANT: never return password in queries by default
    },
  },
  {
    timestamps: true,   // auto adds createdAt and updatedAt fields
  }
);

// ── HASH PASSWORD BEFORE SAVING ───────────────────────
// This runs automatically before every .save() call.
// We NEVER store plain text passwords — always hashed.
userSchema.pre('save', async function (next) {
  // only hash if password was actually changed (not on profile updates)
  if (!this.isModified('password')) return next();

  // bcrypt "salt rounds" = how much work to do. 10 is the standard.
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ── METHOD: compare passwords ─────────────────────────
// We'll call this during login to check if entered password matches stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
