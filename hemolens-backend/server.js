// server.js — the entry point for HemoLens backend
// This file starts the server and connects to MongoDB

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────

// Allow requests from your React frontend (localhost:5173 for Vite)
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Parse incoming JSON bodies (so req.body works)
app.use(express.json());

// Rate limiting — prevents someone from spamming your API
// 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Stricter limit on the AI analysis endpoint (it costs money!)
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: 'Analysis limit reached. Please try again in an hour.' },
});
app.use('/api/reports/upload', analysisLimiter);

// ── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);       // /api/auth/register, /api/auth/login
app.use('/api/reports', reportRoutes);  // /api/reports/upload, /:id, etc.

// Health check — useful to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

// ── Database + Start ────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 HemoLens server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
