import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionsController } from './transaction.controller';
import { TransactionsService } from './services/transaction.service';
import { BalanceService } from './services/balance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionsController],
  providers: [TransactionsService, BalanceService],
})
export class TransactionModule {}
