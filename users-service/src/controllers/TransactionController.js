const walletClient = require('../services/WalletClient');

class TransactionController {
  /**
   * Creates a new transaction
   * POST /transactions
   * Receives external request and forwards to Wallet Service
   */
  async createTransaction(req, res) {
    try {
      const { amount, type, description } = req.body;
      
      // Get userId from external JWT token
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(400).json({ error: 'User ID not found in token' });
      }

      // Call Wallet Service internally
      const result = await walletClient.createTransaction({
        userId,
        amount,
        type: type.toUpperCase(),
        description,
      });

      // Return Wallet Service response
      res.status(200).json(result);
    } catch (error) {
      console.error('Error creating transaction:', error);
      
      // Return Wallet Service error if available
      if (error.response?.data) {
        return res.status(error.response.status || 500).json(error.response.data);
      }
      
      // Connection error or other error
      if (error.code === 'ECONNREFUSED' || error.message.includes('ENOTFOUND')) {
        return res.status(503).json({ error: 'Wallet service unavailable' });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Lists user transactions
   * GET /transactions?type=credit|debit
   * Receives external request and forwards to Wallet Service
   */
  async getTransactions(req, res) {
    try {
      const { type } = req.query;
      
      // Get userId from external JWT token
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(400).json({ error: 'User ID not found in token' });
      }

      // Call Wallet Service internally
      const result = await walletClient.getTransactions(
        userId,
        type ? type.toUpperCase() : null
      );

      // Return Wallet Service response
      res.status(200).json(result);
    } catch (error) {
      console.error('Error getting transactions:', error);
      
      // Return Wallet Service error if available
      if (error.response?.data) {
        return res.status(error.response.status || 500).json(error.response.data);
      }
      
      // Connection error or other error
      if (error.code === 'ECONNREFUSED' || error.message.includes('ENOTFOUND')) {
        return res.status(503).json({ error: 'Wallet service unavailable' });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Returns user consolidated balance
   * GET /balance
   * Receives external request and forwards to Wallet Service
   */
  async getBalance(req, res) {
    try {
      // Get userId from external JWT token
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(400).json({ error: 'User ID not found in token' });
      }

      // Call Wallet Service internally
      const result = await walletClient.getBalance(userId);

      // Return Wallet Service response
      res.status(200).json(result);
    } catch (error) {
      console.error('Error getting balance:', error);
      
      // Return Wallet Service error if available
      if (error.response?.data) {
        return res.status(error.response.status || 500).json(error.response.data);
      }
      
      // Connection error or other error
      if (error.code === 'ECONNREFUSED' || error.message.includes('ENOTFOUND')) {
        return res.status(503).json({ error: 'Wallet service unavailable' });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new TransactionController();

