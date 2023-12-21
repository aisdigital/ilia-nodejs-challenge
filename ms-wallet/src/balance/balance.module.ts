import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { RepositoryModule } from '../repository/repository.module';
import { BalanceRepository } from './balance.repository';

@Module({
  imports: [RepositoryModule],
  controllers: [BalanceController],
  providers: [BalanceService, BalanceRepository],
})
export class BalanceModule {}
