import { TransactionEntity } from "@entities/TransactionEntity";
export interface ITransactionRepository {
  save(amount: number, type: string): Promise<TransactionEntity>;
  findTransaction(type: string): Promise<TransactionEntity[]>;
  findAllTransaction(): Promise<TransactionEntity[]>;
  findBalance(user_id: string): Promise<TransactionEntity[]>;
  findAllBalances(): Promise<TransactionEntity[]>;
}
