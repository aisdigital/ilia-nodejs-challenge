const axios = require('axios');
const { generateInternalToken } = require('../middleware/auth');

/**
 * Client for internal communication with wallet-service
 */
class WalletClient {
  constructor() {
    this.baseURL = process.env.WALLET_SERVICE_URL || 'http://wallet-service:3001/api';
  }

  /**
   * Creates a wallet for a user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async createWalletForUser(userId) {
    try {
      // Generate internal token for service-to-service communication
      const internalToken = generateInternalToken();

      // Make an initial CREDIT transaction with value 0 to create the wallet
      await axios.post(
        `${this.baseURL}/transactions`,
        {
          user_id: userId,
          type: 'CREDIT',
          amount: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${internalToken}`,
          },
        }
      );
    } catch (error) {
      // If wallet already exists, it's not a critical error
      if (error.response?.status !== 400) {
        console.error('Error creating wallet for user:', error.message);
        // Don't throw error to avoid blocking user creation
      }
    }
  }

  /**
   * Creates a transaction in Wallet Service
   * @param {object} transactionData - Transaction data
   * @param {string} transactionData.userId - User ID
   * @param {number} transactionData.amount - Transaction amount
   * @param {string} transactionData.type - Type (CREDIT or DEBIT)
   * @param {string} transactionData.description - Description (optional)
   * @returns {Promise<object>}
   */
  async createTransaction(transactionData) {
    // Generate internal token for service-to-service communication
    const internalToken = generateInternalToken();

    // Internal route URL of Wallet Service
    const internalURL = process.env.WALLET_SERVICE_URL?.replace('/api', '') || 'http://wallet-service:3001';
    const url = `${internalURL}/internal/transactions`;

    const response = await axios.post(
      url,
      {
        userId: transactionData.userId,
        amount: transactionData.amount,
        type: transactionData.type,
        description: transactionData.description,
      },
      {
        headers: {
          Authorization: `Bearer ${internalToken}`,
        },
      }
    );

    return response.data;
  }

  /**
   * Gets user balance from Wallet Service
   * @param {string} userId - User ID
   * @returns {Promise<object>}
   */
  async getBalance(userId) {
    // Generate internal token for service-to-service communication
    const internalToken = generateInternalToken();

    // Internal route URL of Wallet Service
    const internalURL = process.env.WALLET_SERVICE_URL?.replace('/api', '') || 'http://wallet-service:3001';
    const url = `${internalURL}/internal/balance`;

    const response = await axios.get(url, {
      params: { userId },
      headers: {
        Authorization: `Bearer ${internalToken}`,
      },
    });

    return response.data;
  }

  /**
   * Lists user transactions from Wallet Service
   * @param {string} userId - User ID
   * @param {string} type - Optional type (CREDIT or DEBIT)
   * @returns {Promise<array>}
   */
  async getTransactions(userId, type = null) {
    // Generate internal token for service-to-service communication
    const internalToken = generateInternalToken();

    // Internal route URL of Wallet Service
    const internalURL = process.env.WALLET_SERVICE_URL?.replace('/api', '') || 'http://wallet-service:3001';
    const url = `${internalURL}/internal/transactions`;

    const params = { userId };
    if (type) {
      params.type = type;
    }

    const response = await axios.get(url, {
      params,
      headers: {
        Authorization: `Bearer ${internalToken}`,
      },
    });

    return response.data;
  }
}

module.exports = new WalletClient();

