import { TransactionService } from '../transaction.service';
import { ITransactionRepository } from '../transaction.repository.interface';
import { Transaction, TransactionType } from '../transaction.model';
import { InsufficientBalanceError } from '../../../shared/errors/app-error';
import { CreateTransactionDTO } from '../transaction.schema';
import { IBalanceRepository } from '../../balances/balance.repository.interface';
import { UserBalance } from '../../balances/balance.model';
import { TransactionManager } from '../../../shared/database/transaction-manager';

// Mock TransactionManager
jest.mock('../../../shared/database/transaction-manager');

const mockedTransactionManager = jest.mocked(TransactionManager);

describe('TransactionService', () => {
  let service: TransactionService;
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;
  let mockBalanceRepository: jest.Mocked<IBalanceRepository>;

  const mockBalance = (amount: number): UserBalance => ({
    id: 'balance-id',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    amount,
    version: 1,
    created_at: new Date(),
    updated_at: new Date(),
  } as UserBalance);

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configura o mock para executar o callback e retornar seu resultado
    mockedTransactionManager.executeInTransaction.mockImplementation(
      async (callback) => await callback({} as any)
    );

    mockTransactionRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      getBalance: jest.fn(),
    };

    mockBalanceRepository = {
      findByUserId: jest.fn(),
      findByUserIdWithLock: jest.fn(),
      create: jest.fn(),
      updateBalance: jest.fn(),
      incrementBalance: jest.fn(),
      ensureBalance: jest.fn(),
    };

    service = new TransactionService(mockTransactionRepository, mockBalanceRepository);
  });

  describe('create', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should create a CREDIT transaction successfully', async () => {
      const transactionData: CreateTransactionDTO = {
        user_id: userId,
        amount: 100,
        type: TransactionType.CREDIT,
      };

      const mockTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        ...transactionData,
        created_at: new Date(),
        updated_at: new Date(),
      } as Transaction;

      mockBalanceRepository.ensureBalance.mockResolvedValue(mockBalance(0));
      mockBalanceRepository.findByUserIdWithLock.mockResolvedValue(mockBalance(0));
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockBalanceRepository.incrementBalance.mockResolvedValue();

      const result = await service.create(transactionData);

      expect(result).toEqual(mockTransaction);
      expect(mockBalanceRepository.ensureBalance).toHaveBeenCalledWith(userId, expect.anything());
      expect(mockBalanceRepository.incrementBalance).toHaveBeenCalledWith(userId, 100, expect.anything());
    });

    it('should create a DEBIT transaction when balance is sufficient', async () => {
      const transactionData: CreateTransactionDTO = {
        user_id: userId,
        amount: 50,
        type: TransactionType.DEBIT,
      };

      const mockTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        ...transactionData,
        created_at: new Date(),
        updated_at: new Date(),
      } as Transaction;

      mockBalanceRepository.ensureBalance.mockResolvedValue(mockBalance(100));
      mockBalanceRepository.findByUserIdWithLock.mockResolvedValue(mockBalance(100));
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockBalanceRepository.incrementBalance.mockResolvedValue();

      const result = await service.create(transactionData);

      expect(result).toEqual(mockTransaction);
      expect(mockBalanceRepository.incrementBalance).toHaveBeenCalledWith(userId, -50, expect.anything());
    });

    it('should throw InsufficientBalanceError when balance is insufficient for DEBIT', async () => {
      const transactionData: CreateTransactionDTO = {
        user_id: userId,
        amount: 150,
        type: TransactionType.DEBIT,
      };

      mockBalanceRepository.ensureBalance.mockResolvedValue(mockBalance(100));
      mockBalanceRepository.findByUserIdWithLock.mockResolvedValue(mockBalance(100));

      await expect(service.create(transactionData)).rejects.toThrow(InsufficientBalanceError);
      expect(mockTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('should allow DEBIT when balance equals amount', async () => {
      const transactionData: CreateTransactionDTO = {
        user_id: userId,
        amount: 100,
        type: TransactionType.DEBIT,
      };

      const mockTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        ...transactionData,
        created_at: new Date(),
        updated_at: new Date(),
      } as Transaction;

      mockBalanceRepository.ensureBalance.mockResolvedValue(mockBalance(100));
      mockBalanceRepository.findByUserIdWithLock.mockResolvedValue(mockBalance(100));
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockBalanceRepository.incrementBalance.mockResolvedValue();

      const result = await service.create(transactionData);

      expect(result).toEqual(mockTransaction);
    });

    it('should throw InsufficientBalanceError when balance is zero and trying to DEBIT', async () => {
      const transactionData: CreateTransactionDTO = {
        user_id: userId,
        amount: 10,
        type: TransactionType.DEBIT,
      };

      mockBalanceRepository.ensureBalance.mockResolvedValue(mockBalance(0));
      mockBalanceRepository.findByUserIdWithLock.mockResolvedValue(mockBalance(0));

      await expect(service.create(transactionData)).rejects.toThrow(InsufficientBalanceError);
    });

    it('should execute within a database transaction', async () => {
      const transactionData: CreateTransactionDTO = {
        user_id: userId,
        amount: 100,
        type: TransactionType.CREDIT,
      };

      const mockTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        ...transactionData,
        created_at: new Date(),
        updated_at: new Date(),
      } as Transaction;

      mockBalanceRepository.ensureBalance.mockResolvedValue(mockBalance(0));
      mockBalanceRepository.findByUserIdWithLock.mockResolvedValue(mockBalance(0));
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockBalanceRepository.incrementBalance.mockResolvedValue();

      await service.create(transactionData);

      expect(TransactionManager.executeInTransaction).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should list all transactions for a user', async () => {
      const mockTransactions = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          user_id: userId,
          amount: 100,
          type: TransactionType.CREDIT,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          user_id: userId,
          amount: 50,
          type: TransactionType.DEBIT,
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
        },
      ] as Transaction[];

      mockTransactionRepository.findByUserId.mockResolvedValue(mockTransactions);

      const result = await service.list(userId, {});

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionRepository.findByUserId).toHaveBeenCalledWith(userId, undefined);
    });

    it('should filter transactions by type CREDIT', async () => {
      const mockTransactions = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          user_id: userId,
          amount: 100,
          type: TransactionType.CREDIT,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ] as Transaction[];

      mockTransactionRepository.findByUserId.mockResolvedValue(mockTransactions);

      const result = await service.list(userId, { type: TransactionType.CREDIT });

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionRepository.findByUserId).toHaveBeenCalledWith(userId, TransactionType.CREDIT);
    });

    it('should filter transactions by type DEBIT', async () => {
      const mockTransactions = [
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          user_id: userId,
          amount: 50,
          type: TransactionType.DEBIT,
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
        },
      ] as Transaction[];

      mockTransactionRepository.findByUserId.mockResolvedValue(mockTransactions);

      const result = await service.list(userId, { type: TransactionType.DEBIT });

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionRepository.findByUserId).toHaveBeenCalledWith(userId, TransactionType.DEBIT);
    });

    it('should return empty array when no transactions found', async () => {
      mockTransactionRepository.findByUserId.mockResolvedValue([]);

      const result = await service.list(userId, {});

      expect(result).toEqual([]);
      expect(mockTransactionRepository.findByUserId).toHaveBeenCalledWith(userId, undefined);
    });
  });

  describe('getBalance', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return balance as zero when no balance record exists', async () => {
      mockBalanceRepository.findByUserId.mockResolvedValue(null);

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: 0 });
      expect(mockBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return positive balance from materialized balance table', async () => {
      mockBalanceRepository.findByUserId.mockResolvedValue(mockBalance(150.75));

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: 150.75 });
      expect(mockBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return zero balance when balance is zero', async () => {
      mockBalanceRepository.findByUserId.mockResolvedValue(mockBalance(0));

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: 0 });
      expect(mockBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should handle decimal values correctly', async () => {
      mockBalanceRepository.findByUserId.mockResolvedValue(mockBalance(99.99));

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: 99.99 });
      expect(mockBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });
});