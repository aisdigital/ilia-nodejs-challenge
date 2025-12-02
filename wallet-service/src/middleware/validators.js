/**
 * Validation middleware for transaction creation
 * Validates user_id, type and amount
 */
const validateCreateTransaction = (req, res, next) => {
  const { user_id, type, amount } = req.body;
  const errors = [];

  // Validate user_id
  if (!user_id) {
    errors.push('user_id is required');
  } else if (typeof user_id !== 'string' || user_id.trim() === '') {
    errors.push('user_id must be a non-empty string');
  }

  // Validate type
  if (!type) {
    errors.push('type is required');
  } else if (type !== 'CREDIT' && type !== 'DEBIT') {
    errors.push('type must be CREDIT or DEBIT');
  }

  // Validate amount
  if (amount === undefined || amount === null) {
    errors.push('amount is required');
  } else if (typeof amount !== 'number') {
    errors.push('amount must be a number');
  } else if (amount <= 0) {
    errors.push('amount must be a positive number');
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
  if (type && type !== 'CREDIT' && type !== 'DEBIT') {
    return res.status(400).json({ 
      error: 'type must be CREDIT or DEBIT' 
    });
  }

  next();
};

/**
 * Validation middleware for internal transaction creation
 * Validates userId, type and amount (internal format)
 */
const validateCreateTransactionInternal = (req, res, next) => {
  const { userId, type, amount, description } = req.body;
  const errors = [];

  // Validate userId
  if (!userId) {
    errors.push('userId is required');
  } else if (typeof userId !== 'string' || userId.trim() === '') {
    errors.push('userId must be a non-empty string');
  }

  // Validate type
  if (!type) {
    errors.push('type is required');
  } else if (type !== 'CREDIT' && type !== 'DEBIT') {
    errors.push('type must be CREDIT or DEBIT');
  }

  // Validate amount
  if (amount === undefined || amount === null) {
    errors.push('amount is required');
  } else if (typeof amount !== 'number') {
    errors.push('amount must be a number');
  } else if (amount <= 0) {
    errors.push('amount must be a positive number');
  }

  // Validate description (optional)
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

module.exports = {
  validateCreateTransaction,
  validateGetTransactions,
  validateCreateTransactionInternal,
};

