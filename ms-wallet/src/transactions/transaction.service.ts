import { Transaction, TransactionType } from './transaction.model';
import { ITransactionRepository } from './transaction.repository.interface';
import { CreateTransactionDTO } from './transaction.schema';
import { InsufficientBalanceError } from '../shared/errors/app-error';

export class TransactionService {
  constructor(private repository: ITransactionRepository) {}

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    if (data.type === TransactionType.DEBIT) {
      const currentBalance = await this.repository.getBalance(data.user_id);
      
      if (currentBalance < data.amount) {
        throw new InsufficientBalanceError();
      }
    }

    return await this.repository.create(data);
  }
}