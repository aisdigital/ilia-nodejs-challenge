import { Transaction, TransactionType } from '../entities/Transaction';

export interface BalanceResult {
  amount: number;
}

export abstract class IWalletRepository {
  abstract save(transaction: Transaction): Promise<void>;

  abstract findTransactionsByUserId(
    userId: string,
    type?: TransactionType,
  ): Promise<Transaction[]>;

  abstract getBalanceByUserId(userId: string): Promise<BalanceResult>;
}
