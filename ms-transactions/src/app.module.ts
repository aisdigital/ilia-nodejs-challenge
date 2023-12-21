import { Module } from '@nestjs/common';
import { TransactionModule } from './transaction/transaction.module';
import { RepositoryModule } from './repository/repository.module';

@Module({
  imports: [TransactionModule, RepositoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
