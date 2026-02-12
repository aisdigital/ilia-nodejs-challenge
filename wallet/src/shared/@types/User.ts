import { TransactionType } from './TransactionType';

export interface CreateTransactionDto {
  userId: string;
  amount: number;
  type: TransactionType;
}
