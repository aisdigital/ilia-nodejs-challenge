export interface BalanceResponse {
  amount: number | null;
}

export interface TransactionData {
  user_id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionsResponse {
  transactions: Transaction[];
}
