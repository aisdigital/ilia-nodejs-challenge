import { CreateTransaction } from './CreateTransaction';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction, TransactionType } from '../../domain/entities/Transaction';
import {
  InsufficientBalanceError,
  InvalidAmountError,
  InvalidTransactionTypeError,
  UserNotFoundError,
} from '../../domain/errors';

jest.mock('../../infrastructure/grpc/userGrpcClient', () => ({
  userGrpcClient: {
    validateUser: jest.fn(),
  },
}));

import { userGrpcClient } from '../../infrastructure/grpc/userGrpcClient';

describe('CreateTransaction Use Case', () => {
  let createTransaction: CreateTransaction;
  let mockRepository: jest.Mocked<ITransactionRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      calculateBalance: jest.fn(),
    } as jest.Mocked<ITransactionRepository>;

    createTransaction = new CreateTransaction(mockRepository);

    jest.clearAllMocks();
  });

  describe('Credit Transaction', () => {
    it('should create a credit transaction when user is valid', async () => {
      const mockTransaction = new Transaction({
        id: '123',
        userId: 'user-123',
        amount: 100,
        type: TransactionType.CREDIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (userGrpcClient.validateUser as jest.Mock).mockResolvedValue({
        valid: true,
      });

      mockRepository.create.mockResolvedValue(mockTransaction);

      const result = await createTransaction.execute({
        userId: 'user-123',
        amount: 100,
        type: TransactionType.CREDIT,
      });

      expect(result).toEqual(mockTransaction);
      expect(userGrpcClient.validateUser).toHaveBeenCalledWith('user-123');
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        amount: 100,
        type: TransactionType.CREDIT,
      });
    });
  });

  describe('Debit Transaction', () => {
    it('should create a debit transaction when balance is sufficient', async () => {
      const mockTransaction = new Transaction({
        id: '456',
        userId: 'user-456',
        amount: 50,
        type: TransactionType.DEBIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (userGrpcClient.validateUser as jest.Mock).mockResolvedValue({
        valid: true,
      });

      mockRepository.calculateBalance.mockResolvedValue(100);
      mockRepository.create.mockResolvedValue(mockTransaction);

      const result = await createTransaction.execute({
        userId: 'user-456',
        amount: 50,
        type: TransactionType.DEBIT,
      });

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.calculateBalance).toHaveBeenCalledWith('user-456');
    });

    it('should throw InsufficientBalanceError when balance is insufficient', async () => {
      (userGrpcClient.validateUser as jest.Mock).mockResolvedValue({
        valid: true,
      });

      mockRepository.calculateBalance.mockResolvedValue(30);

      await expect(
        createTransaction.execute({
          userId: 'user-456',
          amount: 50,
          type: TransactionType.DEBIT,
        })
      ).rejects.toThrow(InsufficientBalanceError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should throw error for invalid amount (zero)', async () => {
      await expect(
        createTransaction.execute({
          userId: 'user-123',
          amount: 0,
          type: TransactionType.CREDIT,
        })
      ).rejects.toThrow(InvalidAmountError);
    });

    it('should throw error for negative amount', async () => {
      await expect(
        createTransaction.execute({
          userId: 'user-123',
          amount: -10,
          type: TransactionType.CREDIT,
        })
      ).rejects.toThrow(InvalidAmountError);
    });

    it('should throw error for invalid transaction type', async () => {
      await expect(
        createTransaction.execute({
          userId: 'user-123',
          amount: 100,
          type: 'INVALID' as TransactionType,
        })
      ).rejects.toThrow(InvalidTransactionTypeError);
    });

    it('should throw error when user validation fails', async () => {
      (userGrpcClient.validateUser as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'User not found',
      });

      await expect(
        createTransaction.execute({
          userId: 'invalid-user',
          amount: 100,
          type: TransactionType.CREDIT,
        })
      ).rejects.toThrow(UserNotFoundError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});
