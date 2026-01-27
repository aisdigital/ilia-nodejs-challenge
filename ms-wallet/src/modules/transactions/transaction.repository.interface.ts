import { Transaction as SequelizeTransaction } from 'sequelize';
import { Transaction, TransactionType } from './transaction.model';

export interface ITransactionRepository {
  create(data: Partial<Transaction>, dbTransaction?: SequelizeTransaction): Promise<Transaction>;
  findByUserId(userId: string, type?: TransactionType): Promise<Transaction[]>;
}