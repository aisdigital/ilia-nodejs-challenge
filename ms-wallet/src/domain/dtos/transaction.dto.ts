export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export interface TransactionDto {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionRepositoryDto {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
}
