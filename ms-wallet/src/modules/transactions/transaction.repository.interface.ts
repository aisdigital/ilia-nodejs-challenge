import { Transaction, TransactionType } from './transaction.model';

export interface ITransactionRepository {
  create(data: Partial<Transaction>): Promise<Transaction>;
  findByUserId(userId: string, type?: TransactionType): Promise<Transaction[]>;
  getBalance(userId: string): Promise<number>;
}