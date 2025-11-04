import { TransactionType } from '../../domain/dtos/transaction.dto';

export interface TransactionDto {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
}
