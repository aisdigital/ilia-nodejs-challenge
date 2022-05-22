export interface Transactions {
  user_id: string;
  amount: number;
  type: string;
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}
