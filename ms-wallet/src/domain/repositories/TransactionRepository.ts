import { Transaction, TransactionType } from '../entities/Transaction';

export interface TransactionFilters {
  type?: TransactionType;
  userId?: string;
}

export interface Balance {
  amount: number;
}

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  findByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]>;
  getBalance(userId: string): Promise<Balance>;
}