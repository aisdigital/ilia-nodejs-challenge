import { ListTransactions } from './ListTransactions';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction, TransactionType } from '../../domain/entities/Transaction';

describe('ListTransactions Use Case', () => {
  let listTransactions: ListTransactions;
  let mockRepository: jest.Mocked<ITransactionRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      calculateBalance: jest.fn(),
    } as jest.Mocked<ITransactionRepository>;

    listTransactions = new ListTransactions(mockRepository);

    jest.clearAllMocks();
  });

  it('should list all transactions for a user', async () => {
    const mockTransactions = [
      new Transaction({
        id: '1',
        userId: 'user-123',
        amount: 100,
        type: TransactionType.CREDIT,
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-15'),
      }),
      new Transaction({
        id: '2',
        userId: 'user-123',
        amount: 50,
        type: TransactionType.DEBIT,
        createdAt: new Date('2026-01-16'),
        updatedAt: new Date('2026-01-16'),
      }),
    ];

    mockRepository.findByUserId.mockResolvedValue(mockTransactions);

    const result = await listTransactions.execute({ userId: 'user-123' });

    expect(result).toEqual(mockTransactions);
    expect(result).toHaveLength(2);
    expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', undefined);
  });

  it('should list only credit transactions when type is specified', async () => {
    const mockCreditTransactions = [
      new Transaction({
        id: '1',
        userId: 'user-123',
        amount: 100,
        type: TransactionType.CREDIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Transaction({
        id: '3',
        userId: 'user-123',
        amount: 200,
        type: TransactionType.CREDIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];

    mockRepository.findByUserId.mockResolvedValue(mockCreditTransactions);

    const result = await listTransactions.execute({
      userId: 'user-123',
      type: TransactionType.CREDIT,
    });

    expect(result).toEqual(mockCreditTransactions);
    expect(result.every((t) => t.type === TransactionType.CREDIT)).toBe(true);
    expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', TransactionType.CREDIT);
  });

  it('should list only debit transactions when type is specified', async () => {
    const mockDebitTransactions = [
      new Transaction({
        id: '2',
        userId: 'user-456',
        amount: 50,
        type: TransactionType.DEBIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];

    mockRepository.findByUserId.mockResolvedValue(mockDebitTransactions);

    const result = await listTransactions.execute({
      userId: 'user-456',
      type: TransactionType.DEBIT,
    });

    expect(result).toEqual(mockDebitTransactions);
    expect(result.every((t) => t.type === TransactionType.DEBIT)).toBe(true);
    expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-456', TransactionType.DEBIT);
  });

  it('should return empty array when user has no transactions', async () => {
    mockRepository.findByUserId.mockResolvedValue([]);

    const result = await listTransactions.execute({ userId: 'new-user' });

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return empty array when no transactions match the specified type', async () => {
    mockRepository.findByUserId.mockResolvedValue([]);

    const result = await listTransactions.execute({
      userId: 'user-123',
      type: TransactionType.DEBIT,
    });

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
