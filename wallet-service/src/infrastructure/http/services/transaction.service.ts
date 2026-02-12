import { Injectable } from '@nestjs/common';
import { CreateTransactionUseCase } from '../../../core/use-cases/create-transaction/create-transaction.use-case';
import { ListTransactionsUseCase } from '../../../core/use-cases/list-transactions/list-transactions.use-case';
import { GetBalanceUseCase } from '../../../core/use-cases/get-balance/get-balance.use-case';
import { TransactionType } from '../../../core/domain/enum/transaction-type.enum';
import { TransactionEntity } from '../../../core/domain/entities/transaction.entity';
import { BalanceResponseDto } from '../../../core/use-cases/get-balance/get-balance.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly listTransactionsUseCase: ListTransactionsUseCase,
    private readonly getBalanceUseCase: GetBalanceUseCase,
  ) {}

  async createTransaction(
    userId: string,
    amount: number,
    type: TransactionType,
  ): Promise<TransactionEntity> {
    return await this.createTransactionUseCase.execute({
      user_id: userId,
      amount,
      type,
    });
  }

  async listTransactions(
    userId: string,
    type?: TransactionType,
  ): Promise<TransactionEntity[]> {
    return await this.listTransactionsUseCase.execute({
      userId,
      type,
    });
  }

  async getBalance(userId: string): Promise<BalanceResponseDto> {
    return await this.getBalanceUseCase.execute({
      userId,
    });
  }
}
