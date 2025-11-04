import { TransactionType } from '../../domain/dtos/transaction.dto';

export class CreateTransactionDto {
  userId: string;
  amount: number;
  type: TransactionType;
}
