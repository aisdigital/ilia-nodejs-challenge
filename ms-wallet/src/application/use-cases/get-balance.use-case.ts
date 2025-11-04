import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryInterface,
} from '../../domain/repositories/transaction.repository.interface';

@Injectable()
export class GetBalanceUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<number> {
    return await this.transactionRepository.getBalance(userId);
  }
}
