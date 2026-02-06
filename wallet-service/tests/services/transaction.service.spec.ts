import { TransactionService } from '../../src/services/transaction.service';
import { TransactionRepository } from '../../src/repositories/transaction.repository';
import { WalletUserRepository } from '../../src/repositories/wallet-user.repository';

jest.mock('../../src/repositories/transaction.repository');
jest.mock('../../src/repositories/wallet-user.repository');

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: jest.Mocked<TransactionRepository>;
  let mockWalletUserRepository: jest.Mocked<WalletUserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new TransactionRepository() as jest.Mocked<TransactionRepository>;
    mockWalletUserRepository = new WalletUserRepository() as jest.Mocked<WalletUserRepository>;
    service = new TransactionService();
    (service as any).repository = mockRepository;
    (service as any).walletUserRepository = mockWalletUserRepository;
  });

  describe('createTransaction', () => {
    it('should create a transaction when user exists locally', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const createInput = {
        user_id: userId,
        amount: 1000,
        type: 'CREDIT' as const,
      };

      const mockWalletUser = {
        id: 'wallet-user-123',
        externalUserId: userId,
        createdAt: new Date(),
      };

      const mockTransaction = {
        id: 'txn-123',
        userId,
        type: 'CREDIT' as const,
        amount: 1000,
        createdAt: new Date('2024-02-03T10:00:00Z'),
        updatedAt: new Date('2024-02-03T10:00:00Z'),
      };

      mockWalletUserRepository.findByExternalUserId.mockResolvedValueOnce(mockWalletUser as any);
      mockRepository.create.mockResolvedValueOnce(mockTransaction as any);

      const result = await service.createTransaction(userId, createInput);

      expect(mockWalletUserRepository.findByExternalUserId).toHaveBeenCalledWith(userId);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        type: 'CREDIT',
        amount: 1000,
      });

      expect(result).toEqual({
        id: 'txn-123',
        user_id: userId,
        type: 'CREDIT',
        amount: 1000,
        createdAt: mockTransaction.createdAt,
        updatedAt: mockTransaction.updatedAt,
      });

      expect(result.user_id).toBe(userId);
    });

    it('should throw "User Not Valid" error when user is not found locally', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const createInput = {
        user_id: userId,
        amount: 1000,
        type: 'CREDIT' as const,
      };

      mockWalletUserRepository.findByExternalUserId.mockResolvedValueOnce(null);

      await expect(service.createTransaction(userId, createInput)).rejects.toThrow('User Not Valid');
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockWalletUserRepository.findByExternalUserId).toHaveBeenCalledWith(userId);
    });

    it('should handle DEBIT transactions correctly when user exists', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';
      const createInput = {
        user_id: userId,
        amount: 500,
        type: 'DEBIT' as const,
      };

      const mockWalletUser = {
        id: 'wallet-user-456',
        externalUserId: userId,
        createdAt: new Date(),
      };

      const mockTransaction = {
        id: 'txn-456',
        userId,
        type: 'DEBIT' as const,
        amount: 500,
        createdAt: new Date('2024-02-03T11:00:00Z'),
        updatedAt: new Date('2024-02-03T11:00:00Z'),
      };

      mockWalletUserRepository.findByExternalUserId.mockResolvedValueOnce(mockWalletUser as any);
      mockRepository.create.mockResolvedValueOnce(mockTransaction as any);

      const result = await service.createTransaction(userId, createInput);

      expect(result.type).toBe('DEBIT');
      expect(result.amount).toBe(500);
      expect(result.user_id).toBe(userId);
    });

    it('should validate user before checking amount limits', async () => {
      const userId = 'non-existent-user';
      const createInput = {
        user_id: userId,
        amount: Number.MAX_SAFE_INTEGER + 1,
        type: 'CREDIT' as const,
      };

      mockWalletUserRepository.findByExternalUserId.mockResolvedValueOnce(null);

      await expect(service.createTransaction(userId, createInput)).rejects.toThrow('User Not Valid');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('calculateBalance', () => {
    it('should correctly subtract DEBIT from CREDIT', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';

      const mockGroupedTransactions = [
        {
          type: 'CREDIT',
          _sum: {
            amount: 3000,
          },
        },
        {
          type: 'DEBIT',
          _sum: {
            amount: 1000,
          },
        },
      ];

      mockRepository.getGroupedByType.mockResolvedValueOnce(mockGroupedTransactions as any);

      const result = await service.calculateBalance(userId);

      expect(result.amount).toBe(2000);
      expect(mockRepository.getGroupedByType).toHaveBeenCalledWith(userId);
    });

    it('should return only CREDIT sum when no DEBIT transactions exist', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';

      const mockGroupedTransactions = [
        {
          type: 'CREDIT',
          _sum: {
            amount: 5000,
          },
        },
      ];

      mockRepository.getGroupedByType.mockResolvedValueOnce(mockGroupedTransactions as any);

      const result = await service.calculateBalance(userId);

      expect(result.amount).toBe(5000);
    });

    it('should return negative balance when DEBIT exceeds CREDIT', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440002';

      const mockGroupedTransactions = [
        {
          type: 'CREDIT',
          _sum: {
            amount: 1000,
          },
        },
        {
          type: 'DEBIT',
          _sum: {
            amount: 3000,
          },
        },
      ];

      mockRepository.getGroupedByType.mockResolvedValueOnce(mockGroupedTransactions as any);

      const result = await service.calculateBalance(userId);

      expect(result.amount).toBe(-2000);
    });

    it('should return 0 when user has no transactions', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440003';

      mockRepository.getGroupedByType.mockResolvedValueOnce([]);

      const result = await service.calculateBalance(userId);

      expect(result.amount).toBe(0);
    });

    it('should return only DEBIT sum when no CREDIT transactions exist', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440004';

      const mockGroupedTransactions = [
        {
          type: 'DEBIT',
          _sum: {
            amount: 500,
          },
        },
      ];

      mockRepository.getGroupedByType.mockResolvedValueOnce(mockGroupedTransactions as any);

      const result = await service.calculateBalance(userId);

      expect(result.amount).toBe(-500);
    });

    it('should handle null sum values as zero', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440005';

      const mockGroupedTransactions = [
        {
          type: 'CREDIT',
          _sum: {
            amount: null,
          },
        },
        {
          type: 'DEBIT',
          _sum: {
            amount: null,
          },
        },
      ];

      mockRepository.getGroupedByType.mockResolvedValueOnce(mockGroupedTransactions as any);

      const result = await service.calculateBalance(userId);

      expect(result.amount).toBe(0);
    });

    it('should call getGroupedByType with correct userId', async () => {
      const userId = 'specific-user-id';

      mockRepository.getGroupedByType.mockResolvedValueOnce([]);

      await service.calculateBalance(userId);

      expect(mockRepository.getGroupedByType).toHaveBeenCalledWith(userId);
      expect(mockRepository.getGroupedByType).toHaveBeenCalledTimes(1);
    });
  });

  describe('listTransactions', () => {
    it('should return list of transactions with transformed user_id', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';

      const mockTransactions = [
        {
          id: 'txn-1',
          userId,
          type: 'CREDIT' as const,
          amount: 1000,
          createdAt: new Date('2024-02-03T10:00:00Z'),
          updatedAt: new Date('2024-02-03T10:00:00Z'),
        },
        {
          id: 'txn-2',
          userId,
          type: 'DEBIT' as const,
          amount: 500,
          createdAt: new Date('2024-02-03T11:00:00Z'),
          updatedAt: new Date('2024-02-03T11:00:00Z'),
        },
      ];

      mockRepository.findByUser.mockResolvedValueOnce(mockTransactions as any);

      const result = await service.listTransactions(userId);

      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBe(userId);
      expect(result[1].user_id).toBe(userId);
      expect(result[0].type).toBe('CREDIT');
      expect(result[1].type).toBe('DEBIT');
    });

    it('should filter transactions by type', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';

      const mockTransactions = [
        {
          id: 'txn-1',
          userId,
          type: 'CREDIT' as const,
          amount: 1000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findByUser.mockResolvedValueOnce(mockTransactions as any);

      const result = await service.listTransactions(userId, 'CREDIT');

      expect(mockRepository.findByUser).toHaveBeenCalledWith(userId, 'CREDIT');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('CREDIT');
    });

    it('should return empty array when no transactions found', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440002';

      mockRepository.findByUser.mockResolvedValueOnce([]);

      const result = await service.listTransactions(userId);

      expect(result).toEqual([]);
    });
  });
});
