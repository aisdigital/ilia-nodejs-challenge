export type Transactions = {
  user_id: string;
  amount: number;
  type: string;
};

export type TransactionsModel = {
  id: string;
  user_id: string;
  amount: number;
  type: string;
};

export type Balance = {
  amount: number;
};
