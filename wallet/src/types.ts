enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export type Transactions = {
  user_id: string;
  amount: number;
  type: TransactionType;
};

export type TransactionsModel = {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
};

export type Balance = {
  amount: number;
};
