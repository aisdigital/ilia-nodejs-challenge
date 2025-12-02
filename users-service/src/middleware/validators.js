/**
 * Validation middleware for user creation
 */
const validateCreateUser = (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  const errors = [];

  if (!first_name) {
    errors.push('first_name is required');
  } else if (typeof first_name !== 'string' || first_name.trim() === '') {
    errors.push('first_name must be a non-empty string');
  }

  if (!last_name) {
    errors.push('last_name is required');
  } else if (typeof last_name !== 'string' || last_name.trim() === '') {
    errors.push('last_name must be a non-empty string');
  }

  if (!email) {
    errors.push('email is required');
  } else if (typeof email !== 'string' || email.trim() === '') {
    errors.push('email must be a non-empty string');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('email must be a valid email address');
  }

  if (!password) {
    errors.push('password is required');
  } else if (typeof password !== 'string' || password.length < 6) {
    errors.push('password must be a string with at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: errors.length === 1 ? errors[0] : errors.join(', ') 
    });
  }

  next();
};

/**
 * Validation middleware for user update
 */
const validateUpdateUser = (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  const errors = [];

  if (first_name !== undefined) {
    if (typeof first_name !== 'string' || first_name.trim() === '') {
      errors.push('first_name must be a non-empty string');
    }
  }

  if (last_name !== undefined) {
    if (typeof last_name !== 'string' || last_name.trim() === '') {
      errors.push('last_name must be a non-empty string');
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || email.trim() === '') {
      errors.push('email must be a non-empty string');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('email must be a valid email address');
    }
  }

  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 6) {
      errors.push('password must be a string with at least 6 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: errors.length === 1 ? errors[0] : errors.join(', ') 
    });
  }

  next();
};

/**
 * Validation middleware for authentication
 */
const validateAuth = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('email is required');
  } else if (typeof email !== 'string' || email.trim() === '') {
    errors.push('email must be a non-empty string');
  }

  if (!password) {
    errors.push('password is required');
  } else if (typeof password !== 'string') {
    errors.push('password must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: errors.length === 1 ? errors[0] : errors.join(', ') 
    });
  }

  next();
};

/**
 * Validation middleware for user ID
 */
const validateUserId = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Validate basic UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  next();
};

/**
 * Validation middleware for transaction creation
 */
const validateCreateTransaction = (req, res, next) => {
  const { amount, type, description } = req.body;
  const errors = [];

  if (amount === undefined || amount === null) {
    errors.push('amount is required');
  } else if (typeof amount !== 'number') {
    errors.push('amount must be a number');
  } else if (amount <= 0) {
    errors.push('amount must be a positive number');
  }

  if (!type) {
    errors.push('type is required');
  } else if (typeof type !== 'string') {
    errors.push('type must be a string');
  } else if (type.toLowerCase() !== 'credit' && type.toLowerCase() !== 'debit') {
    errors.push('type must be "credit" or "debit"');
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push('description must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: errors.length === 1 ? errors[0] : errors.join(', ') 
    });
  }

  next();
};

/**
 * Validation middleware for transaction listing query params
 * Validates type parameter if provided
 */
const validateGetTransactions = (req, res, next) => {
  const { type } = req.query;

  // Validate type if provided
  if (type && type.toLowerCase() !== 'credit' && type.toLowerCase() !== 'debit') {
    return res.status(400).json({ 
      error: 'type must be "credit" or "debit"' 
    });
  }

  next();
};

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateAuth,
  validateUserId,
  validateCreateTransaction,
  validateGetTransactions,
};

