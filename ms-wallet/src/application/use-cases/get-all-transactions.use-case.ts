import { Inject, Injectable } from '@nestjs/common';
import {
  TransactionRepositoryInterface,
  TRANSACTION_REPOSITORY,
} from '../../domain/repositories/transaction.repository.interface';
import { TransactionType } from '../../domain/dtos/transaction.dto';
import { TransactionDto } from '../dtos/transaction.dto';
import { TransactionApplicationMapper } from '../mappers/transaction-application.mapper';

@Injectable()
export class GetAllTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryInterface,
  ) {}

  async execute(type?: TransactionType): Promise<TransactionDto[]> {
    const transactions = await this.transactionRepository.findAll(type);

    return transactions.map((transaction) =>
      TransactionApplicationMapper.toApplicationDto(transaction),
    );
  }
}
