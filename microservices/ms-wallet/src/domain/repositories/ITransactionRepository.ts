import { Transaction, TransactionType } from '../../domain/entities/Transaction';

export interface CreateTransactionDTO {
  userId: string;
  amount: number;
  type: TransactionType;
}

export interface ITransactionRepository {
  create(data: CreateTransactionDTO): Promise<Transaction>;
  findByUserId(userId: string, type?: TransactionType): Promise<Transaction[]>;
  calculateBalance(userId: string): Promise<number>;
}
