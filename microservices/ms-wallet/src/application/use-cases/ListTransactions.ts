import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction, TransactionType } from '../../domain/entities/Transaction';

export interface ListTransactionsInput {
  userId: string;
  type?: TransactionType;
}

export class ListTransactions {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(input: ListTransactionsInput): Promise<Transaction[]> {
    const transactions = await this.transactionRepository.findByUserId(input.userId, input.type);

    return transactions;
  }
}
