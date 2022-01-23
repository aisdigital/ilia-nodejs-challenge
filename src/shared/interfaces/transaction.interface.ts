import { TransactionType } from "../enums/transaction-type.enums";

export interface ITransaction {
  _id: string;
  user_id?: string;
  amount: number;
  type: TransactionType;
  createdAt: Date;
}
