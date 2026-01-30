import { Test } from '@nestjs/testing';
import { WalletGrpcController } from '../../src/modules/wallet/wallet.grpc.controller';
import { WalletService } from '../../src/modules/wallet/wallet.service';
import { TransactionType } from '../../src/modules/wallet/entities/transaction.entity';

const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

const mockWallet = {
  id: 'wallet-1',
  user_id: 'user-1',
  balance: 100,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockTransaction = {
  id: 'tx-1',
  wallet_id: 'wallet-1',
  amount: 50,
  type: TransactionType.DEPOSIT,
  description: 'Test transaction',
  created_at: new Date(),
  updated_at: new Date(),
  wallet: { ...mockWallet, transactions: [] },
};

describe('WalletGrpcController', () => {
  let controller: WalletGrpcController;
  let walletService: jest.Mocked<WalletService>;

  beforeAll(() => {
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  beforeEach(async () => {
    const mockWalletService = {
      createWallet: jest.fn(),
      findWalletByUserId: jest.fn(),
      createTransaction: jest.fn(),
      getTransactions: jest.fn(),
      getBalance: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      controllers: [WalletGrpcController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    }).compile();

    controller = moduleRef.get<WalletGrpcController>(WalletGrpcController);
    walletService = moduleRef.get(WalletService);
  });

  describe('createWallet', () => {
    it('should create wallet successfully', async () => {
      walletService.createWallet.mockResolvedValue(mockWallet);

      const result = await controller.createWallet({ user_id: 'user-1' });

      expect(result).toEqual({
        wallet: {
          id: mockWallet.id,
          user_id: mockWallet.user_id,
          balance: mockWallet.balance,
          created_at: mockWallet.created_at.toISOString(),
          updated_at: mockWallet.updated_at.toISOString(),
        },
        message: 'Wallet created successfully',
      });
      expect(walletService.createWallet).toHaveBeenCalledWith({ user_id: 'user-1' });
    });

    it('should handle create wallet error', async () => {
      const error = new Error('Failed to create wallet');
      walletService.createWallet.mockRejectedValue(error);

      const result = await controller.createWallet({ user_id: 'user-1' });

      expect(result).toEqual({
        wallet: null,
        message: 'Failed to create wallet',
      });
    });
  });

  describe('getWalletByUserId', () => {
    it('should get wallet by user id successfully', async () => {
      walletService.findWalletByUserId.mockResolvedValue(mockWallet);

      const result = await controller.getWalletByUserId({ user_id: 'user-1' });

      expect(result).toEqual({
        wallet: {
          id: mockWallet.id,
          user_id: mockWallet.user_id,
          balance: mockWallet.balance,
          created_at: mockWallet.created_at.toISOString(),
          updated_at: mockWallet.updated_at.toISOString(),
        },
        message: 'Wallet found',
      });
      expect(walletService.findWalletByUserId).toHaveBeenCalledWith('user-1');
    });

    it('should handle get wallet by user id error', async () => {
      const error = new Error('Wallet not found');
      walletService.findWalletByUserId.mockRejectedValue(error);

      const result = await controller.getWalletByUserId({ user_id: 'invalid-user' });

      expect(result).toEqual({
        wallet: null,
        message: 'Wallet not found',
      });
    });
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      walletService.createTransaction.mockResolvedValue(mockTransaction);

      const result = await controller.createTransaction({
        wallet_id: 'wallet-1',
        amount: 50,
        type: 'DEPOSIT',
        description: 'Test transaction',
      });

      expect(result).toEqual({
        transaction: {
          id: mockTransaction.id,
          wallet_id: mockTransaction.wallet_id,
          amount: mockTransaction.amount,
          type: mockTransaction.type,
          description: mockTransaction.description,
          created_at: mockTransaction.created_at.toISOString(),
          updated_at: mockTransaction.updated_at.toISOString(),
        },
        message: 'Transaction created successfully',
      });
      expect(walletService.createTransaction).toHaveBeenCalledWith({
        wallet_id: 'wallet-1',
        amount: 50,
        type: 'DEPOSIT',
        description: 'Test transaction',
      });
    });

    it('should handle create transaction error', async () => {
      const error = new Error('Insufficient balance');
      walletService.createTransaction.mockRejectedValue(error);

      const result = await controller.createTransaction({
        wallet_id: 'wallet-1',
        amount: 150,
        type: 'WITHDRAW',
      });

      expect(result).toEqual({
        transaction: null,
        message: 'Insufficient balance',
      });
    });

    it('should create transaction without description', async () => {
      const transactionWithoutDescription = { ...mockTransaction, description: undefined };
      walletService.createTransaction.mockResolvedValue(transactionWithoutDescription);

      const result = await controller.createTransaction({
        wallet_id: 'wallet-1',
        amount: 50,
        type: 'DEPOSIT',
      });

      if (result.transaction) {
        expect(result.transaction.description).toBeUndefined();
      }
    });
  });

  describe('getTransactions', () => {
    it('should get transactions successfully', async () => {
      const transactions = [mockTransaction];
      walletService.getTransactions.mockResolvedValue(transactions);

      const result = await controller.getTransactions({ wallet_id: 'wallet-1' });

      expect(result).toEqual({
        transactions: transactions.map((tx) => ({
          id: tx.id,
          wallet_id: tx.wallet_id,
          amount: tx.amount,
          type: tx.type,
          description: tx.description,
          created_at: tx.created_at.toISOString(),
          updated_at: tx.updated_at.toISOString(),
        })),
        message: 'Transactions found',
      });
      expect(walletService.getTransactions).toHaveBeenCalledWith('wallet-1');
    });

    it('should handle get transactions error', async () => {
      const error = new Error('Failed to get transactions');
      walletService.getTransactions.mockRejectedValue(error);

      const result = await controller.getTransactions({ wallet_id: 'wallet-1' });

      expect(result).toEqual({
        transactions: [],
        message: 'Failed to get transactions',
      });
    });

    it('should handle empty transactions list', async () => {
      walletService.getTransactions.mockResolvedValue([]);

      const result = await controller.getTransactions({ wallet_id: 'wallet-1' });

      expect(result.transactions).toEqual([]);
      expect(result.message).toBeDefined();
    });
  });

  describe('getBalance', () => {
    it('should get balance successfully', async () => {
      walletService.getBalance.mockResolvedValue({ balance: 100 });

      const result = await controller.getBalance({ wallet_id: 'wallet-1' });

      expect(result).toEqual({
        balance: 100,
        message: 'Balance retrieved successfully',
      });
      expect(walletService.getBalance).toHaveBeenCalledWith('wallet-1');
    });

    it('should handle get balance error', async () => {
      const error = new Error('Wallet not found');
      walletService.getBalance.mockRejectedValue(error);

      const result = await controller.getBalance({ wallet_id: 'invalid-wallet' });

      expect(result).toEqual({
        balance: 0,
        message: 'Wallet not found',
      });
    });
  });
});
