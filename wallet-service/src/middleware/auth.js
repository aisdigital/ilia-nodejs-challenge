const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authenticateInternalToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Internal access token required' });
  }

  try {
    // Use PRIVATE_KEY_INTERNAL if available, otherwise use JWT_SECRET_INTERNAL
    const secret = process.env.PRIVATE_KEY_INTERNAL || process.env.JWT_SECRET_INTERNAL;
    const decoded = jwt.verify(token, secret);
    req.service = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired internal token' });
  }
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const generateInternalToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_INTERNAL, { expiresIn: '1h' });
};

/**
 * Middleware that accepts both normal and internal tokens
 * Useful for routes that can be accessed by both users and other services
 */
const authenticateTokenOrInternal = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Try to validate as normal token first
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    // If it fails, try to validate as internal token
    try {
      const internalSecret = process.env.PRIVATE_KEY_INTERNAL || process.env.JWT_SECRET_INTERNAL;
      const decoded = jwt.verify(token, internalSecret);
      req.service = decoded;
      // For internal tokens, allow user_id to come from body
      return next();
    } catch (internalError) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  }
};

module.exports = {
  authenticateToken,
  authenticateInternalToken,
  authenticateTokenOrInternal,
  generateToken,
  generateInternalToken,
};
