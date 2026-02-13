import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from '../../../../src/core/use-cases/create-transaction/create-transaction.use-case';
import { TRANSACTION_REPOSITORY } from '../../../../src/core/domain/repositories/transaction.repository.interface';
import { TransactionType } from '../../../../src/core/domain/enum/transaction-type.enum';
import { TransactionEntity } from '../../../../src/core/domain/entities/transaction.entity';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
  });

  it('should create a transaction successfully', async () => {
    const dto = {
      user_id: '507f1f77bcf86cd799439011',
      amount: 10000,
      type: TransactionType.CREDIT,
    };

    const expectedTransaction = new TransactionEntity({
      id: '1',
      ...dto,
    });

    mockRepository.create.mockResolvedValue(expectedTransaction);

    const result = await useCase.execute(dto);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: dto.user_id,
        amount: dto.amount,
        type: dto.type,
      }),
    );
    expect(result).toEqual(expectedTransaction);
  });
});