export type TransactionType = 'CREDIT' | 'DEBIT';

export interface Transaction {
  user_id: string;
  amount: number;
  type: TransactionType;
}

export interface TransactionModel {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BalanceResponse {
  amount: number;
}

export interface GroupedTransaction {
  type: TransactionType;
  _sum: {
    amount: number | null;
  };
}
