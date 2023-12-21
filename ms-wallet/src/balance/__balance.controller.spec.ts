import { Test, TestingModule } from '@nestjs/testing';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { RepositoryModule } from '../repository/repository.module';
import { BalanceRepository } from './balance.repository';

describe('BalanceController', () => {
  let controller: BalanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule],
      controllers: [BalanceController],
      providers: [BalanceService, BalanceRepository],
    }).compile();

    controller = module.get<BalanceController>(BalanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
