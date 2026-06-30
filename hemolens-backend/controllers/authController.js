// controllers/authController.js
// Handles user registration and login

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate a JWT token for a user
function signToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/auth/register
 * Creates a new user account
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, dateOfBirth, gender } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Create user (password gets hashed automatically via the model's pre-save hook)
    const user = await User.create({ name, email, password, dateOfBirth, gender });

    // Generate token so they're logged in immediately after registering
    const token = signToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err); // pass to error handler
  }
};

/**
 * POST /api/auth/login
 * Logs in a user and returns a JWT token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user — include password (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      // Use a vague message — don't tell them which part was wrong
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const token = signToken(user._id);

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently logged-in user's info
 */
const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = { register, login, getMe };
