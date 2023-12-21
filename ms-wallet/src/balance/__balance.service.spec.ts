import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { RepositoryModule } from '../repository/repository.module';
import { BalanceRepository } from './balance.repository';

describe('BalanceService', () => {
  let service: BalanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [BalanceService, BalanceRepository],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


});
