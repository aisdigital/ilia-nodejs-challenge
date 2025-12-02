const express = require('express');
const router = express.Router();
const { authenticateToken, authExternal } = require('../middleware/auth');
const { 
  validateCreateUser,
  validateUpdateUser,
  validateAuth,
  validateUserId,
  validateCreateTransaction,
  validateGetTransactions
} = require('../middleware/validators');
const userController = require('../controllers/UserController');
const authController = require('../controllers/AuthController');
const transactionController = require('../controllers/TransactionController');

// Authentication routes (no JWT authentication required)
router.post(
  '/auth',
  validateAuth,
  authController.authenticate.bind(authController)
);

// User routes
// POST /users does not require authentication (public registration)
router.post(
  '/users',
  validateCreateUser,
  userController.createUser.bind(userController)
);

// Other routes require JWT authentication

router.get(
  '/users',
  authenticateToken,
  userController.getAllUsers.bind(userController)
);

router.get(
  '/users/:id',
  authenticateToken,
  validateUserId,
  userController.getUserById.bind(userController)
);

router.patch(
  '/users/:id',
  authenticateToken,
  validateUserId,
  validateUpdateUser,
  userController.updateUser.bind(userController)
);

router.delete(
  '/users/:id',
  authenticateToken,
  validateUserId,
  userController.deleteUser.bind(userController)
);

// Transaction routes
router.post(
  '/transactions',
  authExternal,
  validateCreateTransaction,
  transactionController.createTransaction.bind(transactionController)
);

router.get(
  '/transactions',
  authExternal,
  validateGetTransactions,
  transactionController.getTransactions.bind(transactionController)
);

router.get(
  '/balance',
  authExternal,
  transactionController.getBalance.bind(transactionController)
);

module.exports = router;

