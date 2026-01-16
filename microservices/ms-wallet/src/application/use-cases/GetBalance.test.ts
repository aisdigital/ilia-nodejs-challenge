import { GetBalance } from './GetBalance';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';

describe('GetBalance Use Case', () => {
  let getBalance: GetBalance;
  let mockRepository: jest.Mocked<ITransactionRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      calculateBalance: jest.fn(),
    } as jest.Mocked<ITransactionRepository>;

    getBalance = new GetBalance(mockRepository);

    jest.clearAllMocks();
  });

  it('should return balance for user with transactions', async () => {
    mockRepository.calculateBalance.mockResolvedValue(150.75);

    const result = await getBalance.execute({ userId: 'user-123' });

    expect(result.amount).toBe(150.75);
    expect(mockRepository.calculateBalance).toHaveBeenCalledWith('user-123');
  });

  it('should return zero balance for user with no transactions', async () => {
    mockRepository.calculateBalance.mockResolvedValue(0);

    const result = await getBalance.execute({ userId: 'new-user' });

    expect(result.amount).toBe(0);
    expect(mockRepository.calculateBalance).toHaveBeenCalledWith('new-user');
  });

  it('should return negative balance when debits exceed credits', async () => {
    mockRepository.calculateBalance.mockResolvedValue(-50.25);

    const result = await getBalance.execute({ userId: 'user-456' });

    expect(result.amount).toBe(-50.25);
    expect(mockRepository.calculateBalance).toHaveBeenCalledWith('user-456');
  });

  it('should handle large balance amounts', async () => {
    mockRepository.calculateBalance.mockResolvedValue(999999.99);

    const result = await getBalance.execute({ userId: 'rich-user' });

    expect(result.amount).toBe(999999.99);
  });
});
