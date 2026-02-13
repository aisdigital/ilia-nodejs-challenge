import { Test, TestingModule } from '@nestjs/testing';
import { GetBalanceUseCase } from '../../../../src/core/use-cases/get-balance/get-balance.use-case';
import { TRANSACTION_REPOSITORY } from '../../../../src/core/domain/repositories/transaction.repository.interface';

describe('GetBalanceUseCase', () => {
  let useCase: GetBalanceUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      calculateBalance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBalanceUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetBalanceUseCase>(GetBalanceUseCase);
  });

  it('should return balance for user', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const expectedBalance = 50000;

    mockRepository.calculateBalance.mockResolvedValue(expectedBalance);

    const result = await useCase.execute({ userId });

    expect(mockRepository.calculateBalance).toHaveBeenCalledWith(userId);
    expect(result.amount).toBe(expectedBalance);
  });

  it('should return zero balance when no transactions', async () => {
    const userId = '507f1f77bcf86cd799439011';

    mockRepository.calculateBalance.mockResolvedValue(0);

    const result = await useCase.execute({ userId });

    expect(result.amount).toBe(0);
  });
});