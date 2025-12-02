const express = require('express');
const router = express.Router();
const { authenticateInternalToken } = require('../middleware/auth');
const { validateCreateTransactionInternal } = require('../middleware/validators');
const transactionController = require('../controllers/TransactionController');

// Internal routes (service-to-service communication)
router.post(
  '/internal/transactions',
  authenticateInternalToken,
  validateCreateTransactionInternal,
  transactionController.createTransactionInternal.bind(transactionController)
);

router.get(
  '/internal/transactions',
  authenticateInternalToken,
  transactionController.getTransactionsInternal.bind(transactionController)
);

router.get(
  '/internal/balance',
  authenticateInternalToken,
  transactionController.getBalanceInternal.bind(transactionController)
);

module.exports = router;

