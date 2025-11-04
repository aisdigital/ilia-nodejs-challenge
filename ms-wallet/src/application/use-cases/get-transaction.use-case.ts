import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TransactionRepositoryInterface,
  TRANSACTION_REPOSITORY,
} from '../../domain/repositories/transaction.repository.interface';
import { TransactionDto } from '../dtos/transaction.dto';
import { TransactionApplicationMapper } from '../mappers/transaction-application.mapper';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryInterface,
  ) {}

  async execute(id: string): Promise<TransactionDto> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return TransactionApplicationMapper.toApplicationDto(transaction);
  }
}
