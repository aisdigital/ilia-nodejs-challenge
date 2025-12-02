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

/**
 * Middleware for external authentication using JWT with PRIVATE_KEY (ILIACHALLENGE)
 */
const authExternal = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY || process.env.JWT_SECRET);
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET_INTERNAL);
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
  const defaultPayload = {
    service: 'users-service',
    role: 'internal',
    ...payload,
  };
  return jwt.sign(defaultPayload, process.env.PRIVATE_KEY_INTERNAL || process.env.JWT_SECRET_INTERNAL, { expiresIn: '1h' });
};

module.exports = {
  authenticateToken,
  authenticateInternalToken,
  authExternal,
  generateToken,
  generateInternalToken,
};

