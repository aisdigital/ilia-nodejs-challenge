import { Transaction } from './transaction.model';

export interface ITransactionRepository {
  create(data: Partial<Transaction>): Promise<Transaction>;
  
}