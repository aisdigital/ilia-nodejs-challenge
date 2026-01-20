import { sequelize } from "../config/database";
import { Transaction } from "./transaction.model";
import { ITransactionRepository } from "./transaction.repository.interface";

export class TransactionRepository implements ITransactionRepository {

  async create(data: Partial<Transaction>): Promise<Transaction> {
    return Transaction.create(data as any);
  }
  
  async getBalance(userId: string): Promise<number> {
    const result = await Transaction.findOne({
      attributes: [
        [
          sequelize.literal(`
            COALESCE(
              SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) -
              SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END),
              0
            )
          `),
          'balance',
        ],
      ],
      where: { user_id: userId },
      raw: true,
    } as any);

    return Number((result as any)?.balance) || 0;
  }
}