import { TransactionType } from "../../enums/transaction-type.enums";

export interface ITransactionDTO {
  user_id?: string;
  amount: number;
  type: TransactionType;
}
