import { Transaction, TransactionType } from '../entities/Transaction';
import { TransactionRepository } from '../repositories/TransactionRepository';

export interface CreateTransactionRequest {
  userId: string;
  amount: number;
  type: TransactionType;
}

export class CreateTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(request: CreateTransactionRequest): Promise<Transaction> {
    const transaction = Transaction.create({
      userId: request.userId,
      amount: request.amount,
      type: request.type
    });

    return await this.transactionRepository.save(transaction);
  }
}