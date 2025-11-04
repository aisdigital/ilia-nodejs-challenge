import { Inject, Injectable } from '@nestjs/common';
import {
  TransactionRepositoryInterface,
  TRANSACTION_REPOSITORY,
} from '../../domain/repositories/transaction.repository.interface';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { TransactionDto } from '../dtos/transaction.dto';
import { TransactionApplicationMapper } from '../mappers/transaction-application.mapper';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryInterface,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<TransactionDto> {
    const transactionToCreate =
      TransactionApplicationMapper.toCreateRepositoryDto(dto);

    const createdTransaction =
      await this.transactionRepository.create(transactionToCreate);

    return TransactionApplicationMapper.toApplicationDto(createdTransaction);
  }
}
