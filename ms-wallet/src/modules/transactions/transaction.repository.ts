import { Transaction as SequelizeTransaction } from 'sequelize';
import { Transaction, TransactionType } from "./transaction.model";
import { ITransactionRepository } from "./transaction.repository.interface";

export class TransactionRepository implements ITransactionRepository {

  async create(
    data: Partial<Transaction>, 
    dbTransaction?: SequelizeTransaction
  ): Promise<Transaction> {
    return Transaction.create(data as any, { transaction: dbTransaction });
  }

  async findByUserId(userId: string, type?: TransactionType): Promise<Transaction[]> {
    const where: any = { user_id: userId };
    
    if (type) {
      where.type = type;
    }

    return Transaction.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
  }
}