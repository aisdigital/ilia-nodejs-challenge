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
});