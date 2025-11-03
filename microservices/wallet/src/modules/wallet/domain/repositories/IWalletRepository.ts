import { Transaction, TransactionType } from '../entities/Transaction';

export interface BalanceResult {
  amount: number;
}

export interface IWalletRepository {
  save(transaction: Transaction): Promise<void>;

  findTransactionsByUserId(
    userId: string,
    type?: TransactionType,
  ): Promise<Transaction[]>;

  getBalanceByUserId(userId: string): Promise<BalanceResult>;
}
