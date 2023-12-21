import { Test, TestingModule } from '@nestjs/testing';
import { BalanceRepository } from './balance.repository';
import { RepositoryModule } from '../repository/repository.module';

describe('BalanceRepository', () => {
  let service: BalanceRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [BalanceRepository],
    }).compile();

    service = module.get<BalanceRepository>(BalanceRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('GetBallance', () => {
    it('should return a consolidate value of credit and debit operations', async () => {
      const response = await service.getBalance();
      expect(response).toMatchObject({ 'credit': expect.anything(), 'debit': expect.anything() });
    });
  });
});
