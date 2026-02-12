import { TransactionType } from '../../domain/enum/transaction-type.enum';

export class CreateTransactionDto {
  user_id: string;
  amount: number;
  type: TransactionType;
}
