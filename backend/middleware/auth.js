const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token present in Authorization header (Bearer <token>).
 * Attaches decoded token payload to req.user on success.
 * Returns 401 Unauthorized if token is missing, invalid, or expired.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authorization token missing or malformed'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      details: err.message
    });
  }
};

module.exports = authMiddleware;
