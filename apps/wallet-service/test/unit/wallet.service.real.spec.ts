import { NotFoundException } from '@nestjs/common';
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
  transactions: [],
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

// Import the real service to ensure coverage
const RealWalletService = WalletService;

describe('WalletService', () => {
  let service: any;
  let walletRepository: any;
  let transactionRepository: any;

  beforeAll(() => {
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  beforeEach(() => {
    walletRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    transactionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        getRepository: jest.fn().mockImplementation((entity: any) => {
          const name = entity?.name ?? entity;
          if (name === 'Wallet') return walletRepository;
          if (name === 'Transaction') return transactionRepository;
          return walletRepository;
        }),
      },
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    service = new RealWalletService(walletRepository, transactionRepository, mockDataSource as any);
    jest.clearAllMocks();

    mockWallet.balance = 100;
  });

  describe('createWallet', () => {
    it('should create a wallet successfully', async () => {
      const createWalletDto = { user_id: 'user-1' };

      walletRepository.create.mockReturnValue(mockWallet);
      walletRepository.save.mockResolvedValue(mockWallet);

      const result = await service.createWallet(createWalletDto);

      expect(result).toEqual(mockWallet);
      expect(walletRepository.create).toHaveBeenCalledWith(createWalletDto);
      expect(walletRepository.save).toHaveBeenCalledWith(mockWallet);
    });
  });

  describe('findWalletByUserId', () => {
    it('should find wallet by user_id successfully', async () => {
      walletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.findWalletByUserId('user-1');

      expect(result).toEqual(mockWallet);
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        relations: ['transactions'],
      });
    });

    it('should throw NotFoundException if wallet not found', async () => {
      walletRepository.findOne.mockResolvedValue(null);

      await expect(service.findWalletByUserId('invalid-user')).rejects.toThrow(NotFoundException);
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: 'invalid-user' },
        relations: ['transactions'],
      });
    });
  });

  describe('createTransaction', () => {
    it('should create a deposit transaction successfully', async () => {
      const createTransactionDto = {
        wallet_id: 'wallet-1',
        amount: 50,
        type: TransactionType.DEPOSIT,
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);
      walletRepository.save.mockResolvedValue({ ...mockWallet, balance: 150 });

      const result = await service.createTransaction(createTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'wallet-1' },
      });
      expect(transactionRepository.create).toHaveBeenCalledWith(createTransactionDto);
      expect(walletRepository.save).toHaveBeenCalledWith({ ...mockWallet, balance: 150 });
    });

    it('should create a withdraw transaction successfully', async () => {
      const createTransactionDto = {
        wallet_id: 'wallet-1',
        amount: 30,
        type: TransactionType.WITHDRAW,
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);
      walletRepository.save.mockResolvedValue({ ...mockWallet, balance: 70 });

      const result = await service.createTransaction(createTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(walletRepository.save).toHaveBeenCalledWith({ ...mockWallet, balance: 70 });
    });

    it('should handle deposit transaction type correctly', async () => {
      const createTransactionDto = {
        wallet_id: 'wallet-1',
        amount: 50,
        type: TransactionType.DEPOSIT,
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);
      walletRepository.save.mockResolvedValue({ ...mockWallet, balance: 150 });

      await service.createTransaction(createTransactionDto);

      // Verify that balance was increased for deposit
      expect(walletRepository.save).toHaveBeenCalledWith(expect.objectContaining({ balance: 150 }));
    });

    it('should handle withdraw transaction type correctly', async () => {
      const createTransactionDto = {
        wallet_id: 'wallet-1',
        amount: 30,
        type: TransactionType.WITHDRAW,
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);
      walletRepository.save.mockResolvedValue({ ...mockWallet, balance: 70 });

      await service.createTransaction(createTransactionDto);

      expect(walletRepository.save).toHaveBeenCalledWith(expect.objectContaining({ balance: 70 }));
    });

    it('should throw NotFoundException if wallet not found for transaction', async () => {
      const createTransactionDto = {
        wallet_id: 'invalid-wallet',
        amount: 50,
        type: TransactionType.DEPOSIT,
      };

      walletRepository.findOne.mockResolvedValue(null);

      await expect(service.createTransaction(createTransactionDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invalid-wallet' },
      });
    });

    it('should throw Error for insufficient balance', async () => {
      const createTransactionDto = {
        wallet_id: 'wallet-1',
        amount: 150,
        type: TransactionType.WITHDRAW,
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);

      await expect(service.createTransaction(createTransactionDto)).rejects.toThrow(
        'Insufficient balance',
      );
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'wallet-1' },
      });
    });

    it('should handle transaction rollback on error', async () => {
      const createTransactionDto = {
        wallet_id: 'wallet-1',
        amount: 50,
        type: TransactionType.DEPOSIT,
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      transactionRepository.create.mockReturnValue(mockTransaction);

      // Simulate error during save
      const saveError = new Error('Database error');
      transactionRepository.save.mockRejectedValue(saveError);

      const mockQueryRunner = {
        connect: jest.fn().mockResolvedValue(undefined),
        startTransaction: jest.fn().mockResolvedValue(undefined),
        commitTransaction: jest.fn().mockResolvedValue(undefined),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
        release: jest.fn().mockResolvedValue(undefined),
        manager: {
          getRepository: jest.fn().mockImplementation((entity: any) => {
            const name = entity?.name ?? entity;
            if (name === 'Wallet') return walletRepository;
            if (name === 'Transaction') return transactionRepository;
            return walletRepository;
          }),
        },
      };

      const mockDataSource = {
        createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      };

      const serviceWithMockDataSource = new RealWalletService(
        walletRepository,
        transactionRepository,
        mockDataSource as any,
      );

      await expect(
        serviceWithMockDataSource.createTransaction(createTransactionDto),
      ).rejects.toThrow('Database error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should handle transaction commit on success', async () => {
      const createTransactionDto = {
        wallet_id: 'wallet-1',
        amount: 50,
        type: TransactionType.DEPOSIT,
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);
      walletRepository.save.mockResolvedValue({ ...mockWallet, balance: 150 });

      const mockQueryRunner = {
        connect: jest.fn().mockResolvedValue(undefined),
        startTransaction: jest.fn().mockResolvedValue(undefined),
        commitTransaction: jest.fn().mockResolvedValue(undefined),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
        release: jest.fn().mockResolvedValue(undefined),
        manager: {
          getRepository: jest.fn().mockImplementation((entity: any) => {
            const name = entity?.name ?? entity;
            if (name === 'Wallet') return walletRepository;
            if (name === 'Transaction') return transactionRepository;
            return walletRepository;
          }),
        },
      };

      const mockDataSource = {
        createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      };

      const serviceWithMockDataSource = new RealWalletService(
        walletRepository,
        transactionRepository,
        mockDataSource as any,
      );

      await serviceWithMockDataSource.createTransaction(createTransactionDto);

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should always call release in finally block even when error occurs', async () => {
      const createTransactionDto = {
        wallet_id: 'wallet-1',
        amount: 50,
        type: TransactionType.DEPOSIT,
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      transactionRepository.create.mockReturnValue(mockTransaction);

      // Simulate error to test finally block
      transactionRepository.save.mockRejectedValue(new Error('Database error'));

      const mockQueryRunner = {
        connect: jest.fn().mockResolvedValue(undefined),
        startTransaction: jest.fn().mockResolvedValue(undefined),
        commitTransaction: jest.fn().mockResolvedValue(undefined),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
        release: jest.fn().mockResolvedValue(undefined),
        manager: {
          getRepository: jest.fn().mockImplementation((entity: any) => {
            const name = entity?.name ?? entity;
            if (name === 'Wallet') return walletRepository;
            if (name === 'Transaction') return transactionRepository;
            return walletRepository;
          }),
        },
      };

      const mockDataSource = {
        createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      };

      const serviceWithMockDataSource = new RealWalletService(
        walletRepository,
        transactionRepository,
        mockDataSource as any,
      );

      // Test error path
      await expect(
        serviceWithMockDataSource.createTransaction(createTransactionDto),
      ).rejects.toThrow('Database error');

      // Verify release was called even in error case
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransactions', () => {
    it('should get transactions successfully', async () => {
      const transactions = [mockTransaction];
      transactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getTransactions('wallet-1');

      expect(result).toEqual(transactions);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { wallet_id: 'wallet-1' },
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('getBalance', () => {
    it('should get balance successfully', async () => {
      walletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.getBalance('wallet-1');

      expect(result).toEqual({ balance: 100 });
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'wallet-1' },
      });
    });

    it('should throw NotFoundException if wallet not found for balance', async () => {
      walletRepository.findOne.mockResolvedValue(null);

      await expect(service.getBalance('invalid-wallet')).rejects.toThrow(NotFoundException);
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invalid-wallet' },
      });
    });
  });
});
