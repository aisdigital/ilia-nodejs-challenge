const { body, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return res.status(400).json({ 
      error: errorMessages.length === 1 ? errorMessages[0] : errorMessages.join(', ') 
    });
  }
  next();
};

/**
 * Validation rules for internal transaction creation
 */
const validateCreateTransactionInternal = [
  body('userId')
    .notEmpty()
    .withMessage('userId is required')
    .isString()
    .withMessage('userId must be a string')
    .trim()
    .notEmpty()
    .withMessage('userId must be a non-empty string'),
  
  body('type')
    .notEmpty()
    .withMessage('type is required')
    .isIn(['CREDIT', 'DEBIT'])
    .withMessage('type must be CREDIT or DEBIT'),
  
  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .custom((value) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num) || typeof num !== 'number') {
        throw new Error('amount must be a number');
      }
      if (num <= 0) {
        throw new Error('amount must be a positive number');
      }
      return true;
    }),
  
  body('description')
    .optional()
    .isString()
    .withMessage('description must be a string'),
  
  handleValidationErrors,
];

/**
 * Validation rules for transaction listing query params
 */
const validateGetTransactions = [
  query('type')
    .optional()
    .isIn(['CREDIT', 'DEBIT'])
    .withMessage('type must be CREDIT or DEBIT'),
  
  query('userId')
    .notEmpty()
    .withMessage('userId is required')
    .isString()
    .withMessage('userId must be a string')
    .trim()
    .notEmpty()
    .withMessage('userId must be a non-empty string'),
  
  handleValidationErrors,
];

/**
 * Validation rules for balance query params
 */
const validateGetBalance = [
  query('userId')
    .notEmpty()
    .withMessage('userId is required')
    .isString()
    .withMessage('userId must be a string')
    .trim()
    .notEmpty()
    .withMessage('userId must be a non-empty string'),
  
  handleValidationErrors,
];

module.exports = {
  validateCreateTransactionInternal,
  validateGetTransactions,
  validateGetBalance,
};
