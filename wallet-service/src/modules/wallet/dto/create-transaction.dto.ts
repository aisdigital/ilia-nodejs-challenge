import { TransactionType } from "../entities/transaction.entity.js";

export interface CreateTransactionDTO {
  user_id: string;
  type: TransactionType;
  amount: number;
}
