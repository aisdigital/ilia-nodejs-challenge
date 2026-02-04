import { TransactionService } from '../../src/services/TransactionService';
import { TransactionRepository } from '../../src/repositories/TransactionRepository';

jest.mock('../../src/repositories/TransactionRepository');

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new TransactionRepository() as jest.Mocked<TransactionRepository>;
    service = new TransactionService();
    (service as any).repository = mockRepository;
  });

  describe('createTransaction', () => {
    it('should create a transaction and return it with transformed user_id', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const createInput = {
        user_id: userId,
        amount: 1000,
        type: 'CREDIT' as const,
      };

      const mockTransaction = {
        id: 'txn-123',
        userId,
        type: 'CREDIT' as const,
        amount: 1000,
        createdAt: new Date('2024-02-03T10:00:00Z'),
        updatedAt: new Date('2024-02-03T10:00:00Z'),
      };

      mockRepository.create.mockResolvedValueOnce(mockTransaction as any);

      const result = await service.createTransaction(userId, createInput);

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

    it('should handle DEBIT transactions correctly', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';
      const createInput = {
        user_id: userId,
        amount: 500,
        type: 'DEBIT' as const,
      };

      const mockTransaction = {
        id: 'txn-456',
        userId,
        type: 'DEBIT' as const,
        amount: 500,
        createdAt: new Date('2024-02-03T11:00:00Z'),
        updatedAt: new Date('2024-02-03T11:00:00Z'),
      };

      mockRepository.create.mockResolvedValueOnce(mockTransaction as any);

      const result = await service.createTransaction(userId, createInput);

      expect(result.type).toBe('DEBIT');
      expect(result.amount).toBe(500);
      expect(result.user_id).toBe(userId);
    });

    it('should pass correct parameters to repository', async () => {
      const userId = 'test-user-id';
      const createInput = {
        user_id: userId,
        amount: 2000,
        type: 'CREDIT' as const,
      };

      mockRepository.create.mockResolvedValueOnce({
        id: 'txn-789',
        userId,
        type: 'CREDIT' as const,
        amount: 2000,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await service.createTransaction(userId, createInput);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        type: 'CREDIT',
        amount: 2000,
      });
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
