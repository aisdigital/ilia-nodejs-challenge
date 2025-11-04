import { TransactionType } from '../../domain/dtos/transaction.dto';

export class TransactionResponseDto {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
}
