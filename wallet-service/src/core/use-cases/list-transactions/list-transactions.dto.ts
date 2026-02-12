import { TransactionType } from '../../domain/enum/transaction-type.enum';

export class ListTransactionsDto {
  userId: string;
  type?: TransactionType;
}