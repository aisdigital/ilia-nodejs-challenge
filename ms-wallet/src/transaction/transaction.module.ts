import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { RepositoryModule } from '../repository/repository.module';
import { TransactionRepository } from './transaction.repository';

@Module({
  imports: [RepositoryModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository],
})
export class TransactionModule {}
