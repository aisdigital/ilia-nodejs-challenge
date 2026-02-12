import { Inject, Injectable } from '@nestjs/common';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import {
  type ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../domain/repositories/transaction.repository.interface';
import { CreateTransactionDto } from './create-transaction.dto';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<TransactionEntity> {
    const transaction = new TransactionEntity({
      user_id: dto.user_id,
      amount: dto.amount,
      type: dto.type,
    });

    return await this.transactionRepository.create(transaction);
  }
}
