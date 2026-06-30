// middleware/errorHandler.js
// Catches all errors thrown anywhere in the app and returns a clean JSON response

const errorHandler = (err, req, res, next) => {
  // Log in development, suppress in production
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 10}MB.`,
    });
  }

  // Mongoose validation error (e.g. missing required field)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join('. ') });
  }

  // Mongoose duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `${field} is already registered.` });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong. Please try again.';

  res.status(statusCode).json({ error: message });
};

module.exports = { errorHandler };
