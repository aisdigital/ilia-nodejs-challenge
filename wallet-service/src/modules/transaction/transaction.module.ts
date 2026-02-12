import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Transaction,
  TransactionSchema,
} from '../../infrastructure/database/mongodb/schemas/transaction.schema';
import { TransactionRepository } from '../../infrastructure/database/repositories/transaction.repository';
import { TRANSACTION_REPOSITORY } from '../../core/domain/repositories/transaction.repository.interface';
import { CreateTransactionUseCase } from '../../core/use-cases/create-transaction/create-transaction.use-case';
import { ListTransactionsUseCase } from '../../core/use-cases/list-transactions/list-transactions.use-case';
import { GetBalanceUseCase } from '../../core/use-cases/get-balance/get-balance.use-case';
import { TransactionController } from '../../infrastructure/http/controllers/transaction.controller';
import { TransactionFacade } from '../../infrastructure/http/facades/transaction.facade';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [TransactionController],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionRepository,
    },
    CreateTransactionUseCase,
    ListTransactionsUseCase,
    GetBalanceUseCase,
    TransactionFacade,
  ],
  exports: [TransactionFacade],
})
export class TransactionModule {}
