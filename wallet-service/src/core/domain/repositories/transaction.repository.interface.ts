import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionType } from '../enum/transaction-type.enum';

export interface ITransactionRepository {
  create(transaction: TransactionEntity): Promise<TransactionEntity>;

  findByUserId(
    userId: string,
    type?: TransactionType,
  ): Promise<TransactionEntity[]>;

  calculateBalance(userId: string): Promise<number>;
}

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');
