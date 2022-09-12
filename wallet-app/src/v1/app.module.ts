import { Module } from '@nestjs/common';
import { TransactionModule } from './transactions/transactions.module';

@Module({
  imports: [TransactionModule],
  exports: [],
})
export class AppModule {}
