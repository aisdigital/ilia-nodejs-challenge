import { Transaction } from "./transaction.model";
import { ITransactionRepository } from "./transaction.repository.interface";

export class TransactionRepository implements ITransactionRepository {

  async create(data: Partial<Transaction>): Promise<Transaction> {
    return Transaction.create(data as any);
  }
}