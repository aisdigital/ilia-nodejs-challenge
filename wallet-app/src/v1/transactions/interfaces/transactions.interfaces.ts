export enum TransactionTypes {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export interface ITransaction {
  user_id: string;
  amount: string;
  type: TransactionTypes;
}

export interface ITransactionResponse {
  _id: string;
  user_id: string;
  amount: string;
  type: TransactionTypes;
}
