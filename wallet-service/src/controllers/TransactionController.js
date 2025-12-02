const transactionService = require('../services/TransactionService');

class TransactionController {
  /**
   * Creates a new transaction
   * POST /transactions
   */
  async createTransaction(req, res) {
    try {
      const { user_id, type, amount } = req.body;

      const transaction = await transactionService.createTransaction(
        user_id,
        type,
        amount
      );

      // Return in the expected API format
      res.status(200).json({
        id: transaction.id,
        user_id: req.body.user_id,
        type: transaction.type,
        amount: parseInt(transaction.amount),
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      
      // Handle insufficient balance error
      if (error.message === 'Insufficient balance') {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Lists user transactions
   * GET /transactions?type=CREDIT|DEBIT
   */
  async getTransactions(req, res) {
    try {
      const { type } = req.query;
      const userId = req.user?.userId || req.user?.id;

      const transactions = await transactionService.getTransactions(userId, type);

      // Format response according to schema
      const formattedTransactions = transactions.map(transaction => ({
        id: transaction.id,
        user_id: userId,
        type: transaction.type,
        amount: parseInt(transaction.amount),
      }));

      res.status(200).json(formattedTransactions);
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Returns user consolidated balance
   * GET /balance
   */
  async getBalance(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;

      const balance = await transactionService.getBalance(userId);

      res.status(200).json({
        amount: parseInt(balance),
      });
    } catch (error) {
      console.error('Error getting balance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Creates a new transaction (internal route)
   * POST /internal/transactions
   * Receives internal call from other services
   */
  async createTransactionInternal(req, res) {
    try {
      const { userId, type, amount, description } = req.body;

      const transaction = await transactionService.createTransaction(
        userId,
        type,
        amount
      );

      // Return in the expected API format
      res.status(200).json({
        id: transaction.id,
        user_id: userId,
        type: transaction.type,
        amount: parseInt(transaction.amount),
      });
    } catch (error) {
      console.error('Error creating transaction (internal):', error);
      
      // Handle insufficient balance error
      if (error.message === 'Insufficient balance') {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Lists user transactions (internal route)
   * GET /internal/transactions
   * Receives internal call from other services
   */
  async getTransactionsInternal(req, res) {
    try {
      const { userId, type } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const transactions = await transactionService.getTransactions(userId, type);

      // Format response according to schema
      const formattedTransactions = transactions.map(transaction => ({
        id: transaction.id,
        user_id: userId,
        type: transaction.type,
        amount: parseInt(transaction.amount),
      }));

      res.status(200).json(formattedTransactions);
    } catch (error) {
      console.error('Error getting transactions (internal):', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Returns user consolidated balance (internal route)
   * GET /internal/balance
   * Receives internal call from other services
   */
  async getBalanceInternal(req, res) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const balance = await transactionService.getBalance(userId);

      res.status(200).json({
        amount: parseInt(balance),
      });
    } catch (error) {
      console.error('Error getting balance (internal):', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new TransactionController();

