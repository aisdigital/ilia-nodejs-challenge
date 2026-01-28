import { walletGrpcClient } from '../wallet.client';

jest.mock('../wallet.client', () => {
  const mockClient = {
    createInitialBalance: jest.fn(),
    getBalance: jest.fn(),
    getTransactions: jest.fn(),
    close: jest.fn(),
  };

  return {
    WalletGrpcClient: jest.fn(),
    walletGrpcClient: mockClient,
  };
});

describe('WalletGrpcClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInitialBalance', () => {
    it('should create initial balance successfully', async () => {
      const userId = 'test-user-id';
      const initialAmount = 100;
      const mockResponse = {
        success: true,
        message: 'Initial balance created',
        transaction: {
          id: 'transaction-id',
          user_id: userId,
          amount: initialAmount,
          type: 'CREDIT',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      (walletGrpcClient.createInitialBalance as jest.Mock).mockResolvedValue(mockResponse);

      const result = await walletGrpcClient.createInitialBalance(userId, initialAmount);

      expect(result).toEqual(mockResponse);
      expect(walletGrpcClient.createInitialBalance).toHaveBeenCalledWith(userId, initialAmount);
    });

    it('should reject when gRPC call fails', async () => {
      const userId = 'test-user-id';
      const mockError = new Error('gRPC connection failed');

      (walletGrpcClient.createInitialBalance as jest.Mock).mockRejectedValue(mockError);

      await expect(walletGrpcClient.createInitialBalance(userId, 0)).rejects.toThrow('gRPC connection failed');
    });

    it('should use default initial amount of 0', async () => {
      const userId = 'test-user-id';
      const mockResponse = {
        success: true,
        message: 'Initial balance created',
      };

      (walletGrpcClient.createInitialBalance as jest.Mock).mockResolvedValue(mockResponse);

      await walletGrpcClient.createInitialBalance(userId, 0);

      expect(walletGrpcClient.createInitialBalance).toHaveBeenCalledWith(userId, 0);
    });
  });

  describe('getBalance', () => {
    it('should get balance successfully', async () => {
      const userId = 'test-user-id';
      const mockResponse = {
        amount: 150.50,
      };

      (walletGrpcClient.getBalance as jest.Mock).mockResolvedValue(mockResponse);

      const result = await walletGrpcClient.getBalance(userId);

      expect(result).toEqual(mockResponse);
      expect(walletGrpcClient.getBalance).toHaveBeenCalledWith(userId);
    });

    it('should reject when gRPC call fails', async () => {
      const userId = 'test-user-id';
      const mockError = new Error('User not found');

      (walletGrpcClient.getBalance as jest.Mock).mockRejectedValue(mockError);

      await expect(walletGrpcClient.getBalance(userId)).rejects.toThrow('User not found');
    });
  });

  describe('getTransactions', () => {
    it('should get all transactions successfully', async () => {
      const userId = 'test-user-id';
      const mockResponse = {
        transactions: [
          {
            id: 'tx-1',
            user_id: userId,
            amount: 100,
            type: 'CREDIT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'tx-2',
            user_id: userId,
            amount: 50,
            type: 'DEBIT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };

      (walletGrpcClient.getTransactions as jest.Mock).mockResolvedValue(mockResponse);

      const result = await walletGrpcClient.getTransactions(userId);

      expect(result).toEqual(mockResponse);
      expect(result.transactions).toHaveLength(2);
      expect(walletGrpcClient.getTransactions).toHaveBeenCalledWith(userId);
    });

    it('should get CREDIT transactions only', async () => {
      const userId = 'test-user-id';
      const mockResponse = {
        transactions: [
          {
            id: 'tx-1',
            user_id: userId,
            amount: 100,
            type: 'CREDIT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };

      (walletGrpcClient.getTransactions as jest.Mock).mockResolvedValue(mockResponse);

      const result = await walletGrpcClient.getTransactions(userId, 'CREDIT');

      expect(result).toEqual(mockResponse);
      expect(walletGrpcClient.getTransactions).toHaveBeenCalledWith(userId, 'CREDIT');
    });

    it('should get DEBIT transactions only', async () => {
      const userId = 'test-user-id';
      const mockResponse = {
        transactions: [
          {
            id: 'tx-2',
            user_id: userId,
            amount: 50,
            type: 'DEBIT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };

      (walletGrpcClient.getTransactions as jest.Mock).mockResolvedValue(mockResponse);

      const result = await walletGrpcClient.getTransactions(userId, 'DEBIT');

      expect(result).toEqual(mockResponse);
      expect(walletGrpcClient.getTransactions).toHaveBeenCalledWith(userId, 'DEBIT');
    });

    it('should reject when gRPC call fails', async () => {
      const userId = 'test-user-id';
      const mockError = new Error('Service unavailable');

      (walletGrpcClient.getTransactions as jest.Mock).mockRejectedValue(mockError);

      await expect(walletGrpcClient.getTransactions(userId)).rejects.toThrow('Service unavailable');
    });
  });
});
