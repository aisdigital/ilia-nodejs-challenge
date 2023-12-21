import { Test, TestingModule } from '@nestjs/testing';
import { TransactionRepository } from './transaction.repository';
import { RepositoryModule } from '../repository/repository.module';

describe('TransactionRepository', () => {
  let repository: TransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [TransactionRepository],
    }).compile();

    repository = module.get<TransactionRepository>(TransactionRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
