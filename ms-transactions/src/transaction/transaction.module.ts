import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { RepositoryModule } from 'src/repository/repository.module';
import { TransactionRepository } from './transaction.repository';

@Module({
  imports: [RepositoryModule],
  controllers: [TransactionController],
  providers: [TransactionService, RepositoryModule, TransactionRepository],
})
export class TransactionModule {}
