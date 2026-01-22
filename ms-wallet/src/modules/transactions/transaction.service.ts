import { Transaction, TransactionType } from './transaction.model';
import { ITransactionRepository } from './transaction.repository.interface';
import { CreateTransactionDTO, ListTransactionsQueryDTO, BalanceResponseDTO } from './transaction.schema';
import { InsufficientBalanceError } from '../../shared/errors/app-error';

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

  async list(userId: string, query: ListTransactionsQueryDTO): Promise<Transaction[]> {
    return await this.repository.findByUserId(userId, query.type);
  }

  async getBalance(userId: string): Promise<BalanceResponseDTO> {
    const balance = await this.repository.getBalance(userId);
    return { amount: balance };
  }
}