import { Module } from '@nestjs/common';
import { TransactionModule } from './transaction/transaction.module';
import { RepositoryModule } from './repository/repository.module';
import { BalanceModule } from './balance/balance.module';

@Module({
  imports: [TransactionModule, RepositoryModule, BalanceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
