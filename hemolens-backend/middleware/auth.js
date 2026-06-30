// middleware/auth.js
// This middleware checks if a user is logged in before allowing access
// It works by verifying the JWT token sent in the request header

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * How it works:
 * 1. Frontend sends: Authorization: Bearer <token>
 * 2. We extract and verify the token
 * 3. We look up the user and attach them to req.user
 * 4. The route handler can then use req.user
 */
const protect = async (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not logged in. Please log in to access this.' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify the token (checks signature + expiry)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
      }
      return res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }

    // 3. Find the user this token belongs to
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found. Please log in again.' });
    }

    // 4. Attach user to request so routes can use it
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authentication error. Please try again.' });
  }
};

module.exports = { protect };
