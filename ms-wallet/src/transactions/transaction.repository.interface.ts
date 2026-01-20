import { Transaction } from './transaction.model';

export interface ITransactionRepository {
  create(data: Partial<Transaction>): Promise<Transaction>;
  getBalance(userId: string): Promise<number>;
}