import { Inject, Injectable } from '@nestjs/common';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import {
  type ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../domain/repositories/transaction.repository.interface';
import { ListTransactionsDto } from './list-transactions.dto';

@Injectable()
export class ListTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(dto: ListTransactionsDto): Promise<TransactionEntity[]> {
    return await this.transactionRepository.findByUserId(dto.userId, dto.type);
  }
}
