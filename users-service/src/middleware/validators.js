const { body, query, param, validationResult } = require('express-validator');

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
 * Validation rules for user creation
 */
const validateCreateUser = [
  body('first_name')
    .notEmpty()
    .withMessage('first_name is required')
    .isString()
    .withMessage('first_name must be a string')
    .trim()
    .notEmpty()
    .withMessage('first_name must be a non-empty string'),
  
  body('last_name')
    .notEmpty()
    .withMessage('last_name is required')
    .isString()
    .withMessage('last_name must be a string')
    .trim()
    .notEmpty()
    .withMessage('last_name must be a non-empty string'),
  
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('email must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isString()
    .withMessage('password must be a string')
    .isLength({ min: 6 })
    .withMessage('password must be a string with at least 6 characters'),
  
  handleValidationErrors,
];

/**
 * Validation rules for user update
 */
const validateUpdateUser = [
  body('first_name')
    .optional()
    .isString()
    .withMessage('first_name must be a string')
    .trim()
    .notEmpty()
    .withMessage('first_name must be a non-empty string'),
  
  body('last_name')
    .optional()
    .isString()
    .withMessage('last_name must be a string')
    .trim()
    .notEmpty()
    .withMessage('last_name must be a non-empty string'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('email must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isString()
    .withMessage('password must be a string')
    .isLength({ min: 6 })
    .withMessage('password must be a string with at least 6 characters'),
  
  handleValidationErrors,
];

/**
 * Validation rules for authentication
 */
const validateAuth = [
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('email must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isString()
    .withMessage('password must be a string'),
  
  handleValidationErrors,
];

/**
 * Validation rules for user ID parameter
 */
const validateUserId = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .custom((value) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        throw new Error('Invalid user ID format');
      }
      return true;
    }),
  
  handleValidationErrors,
];

/**
 * Validation rules for transaction creation
 */
const validateCreateTransaction = [
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
  
  body('type')
    .notEmpty()
    .withMessage('type is required')
    .isString()
    .withMessage('type must be a string')
    .isIn(['credit', 'debit'])
    .withMessage('type must be "credit" or "debit"'),
  
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
    .isIn(['credit', 'debit'])
    .withMessage('type must be "credit" or "debit"'),
  
  handleValidationErrors,
];

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateAuth,
  validateUserId,
  validateCreateTransaction,
  validateGetTransactions,
};
