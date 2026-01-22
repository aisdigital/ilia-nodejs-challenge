import { TransactionService } from '../transaction.service';
import { ITransactionRepository } from '../transaction.repository.interface';
import { Transaction, TransactionType } from '../transaction.model';
import { InsufficientBalanceError } from '../../shared/errors/app-error';
import { CreateTransactionDTO } from '../transaction.schema';

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: jest.Mocked<ITransactionRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      getBalance: jest.fn(),
    };

    service = new TransactionService(mockRepository);
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

      mockRepository.create.mockResolvedValue(mockTransaction);

      const result = await service.create(transactionData);

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.create).toHaveBeenCalledWith(transactionData);
      expect(mockRepository.getBalance).not.toHaveBeenCalled();
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

      mockRepository.getBalance.mockResolvedValue(100);
      mockRepository.create.mockResolvedValue(mockTransaction);

      const result = await service.create(transactionData);

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.getBalance).toHaveBeenCalledWith(userId);
      expect(mockRepository.create).toHaveBeenCalledWith(transactionData);
    });

    it('should throw InsufficientBalanceError when balance is insufficient for DEBIT', async () => {
      const transactionData: CreateTransactionDTO = {
        user_id: userId,
        amount: 150,
        type: TransactionType.DEBIT,
      };

      mockRepository.getBalance.mockResolvedValue(100);

      await expect(service.create(transactionData)).rejects.toThrow(InsufficientBalanceError);
      expect(mockRepository.getBalance).toHaveBeenCalledWith(userId);
      expect(mockRepository.create).not.toHaveBeenCalled();
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

      mockRepository.getBalance.mockResolvedValue(100);
      mockRepository.create.mockResolvedValue(mockTransaction);

      const result = await service.create(transactionData);

      expect(result).toEqual(mockTransaction);
    });

    it('should throw InsufficientBalanceError when balance is zero and trying to DEBIT', async () => {
      const transactionData: CreateTransactionDTO = {
        user_id: userId,
        amount: 10,
        type: TransactionType.DEBIT,
      };

      mockRepository.getBalance.mockResolvedValue(0);

      await expect(service.create(transactionData)).rejects.toThrow(InsufficientBalanceError);
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

      mockRepository.findByUserId.mockResolvedValue(mockTransactions);

      const result = await service.list(userId, {});

      expect(result).toEqual(mockTransactions);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId, undefined);
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

      mockRepository.findByUserId.mockResolvedValue(mockTransactions);

      const result = await service.list(userId, { type: TransactionType.CREDIT });

      expect(result).toEqual(mockTransactions);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId, TransactionType.CREDIT);
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

      mockRepository.findByUserId.mockResolvedValue(mockTransactions);

      const result = await service.list(userId, { type: TransactionType.DEBIT });

      expect(result).toEqual(mockTransactions);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId, TransactionType.DEBIT);
    });

    it('should return empty array when no transactions found', async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      const result = await service.list(userId, {});

      expect(result).toEqual([]);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId, undefined);
    });
  });

  describe('getBalance', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return balance as zero when no transactions exist', async () => {
      mockRepository.getBalance.mockResolvedValue(0);

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: 0 });
      expect(mockRepository.getBalance).toHaveBeenCalledWith(userId);
    });

    it('should return positive balance when CREDIT > DEBIT', async () => {
      mockRepository.getBalance.mockResolvedValue(150.75);

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: 150.75 });
      expect(mockRepository.getBalance).toHaveBeenCalledWith(userId);
    });

    it('should return zero balance when CREDIT = DEBIT', async () => {
      mockRepository.getBalance.mockResolvedValue(0);

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: 0 });
      expect(mockRepository.getBalance).toHaveBeenCalledWith(userId);
    });

    it('should handle decimal values correctly', async () => {
      mockRepository.getBalance.mockResolvedValue(99.99);

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: 99.99 });
      expect(mockRepository.getBalance).toHaveBeenCalledWith(userId);
    });
  });
});