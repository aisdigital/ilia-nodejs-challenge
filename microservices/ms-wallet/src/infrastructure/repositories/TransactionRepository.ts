import {
  ITransactionRepository,
  CreateTransactionDTO,
} from '../../domain/repositories/ITransactionRepository';
import { Transaction, TransactionType } from '../../domain/entities/Transaction';
import TransactionModel from '../database/models/Transaction.model';
import { sequelize } from '../database/sequelize';
import { QueryTypes } from 'sequelize';

export class TransactionRepository implements ITransactionRepository {
  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const transactionModel = await TransactionModel.create(data);
    return this.toDomain(transactionModel);
  }

  async findByUserId(userId: string, type?: TransactionType): Promise<Transaction[]> {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const transactions = await TransactionModel.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return transactions.map(this.toDomain);
  }

  async calculateBalance(userId: string): Promise<number> {
    const result = await sequelize.query<{ balance: string }>(
      `
      SELECT 
        COALESCE(
          SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END), 
          0
        ) as balance
      FROM transactions
      WHERE user_id = :userId
      `,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    );

    return parseFloat(result[0]?.balance || '0');
  }

  private toDomain(model: TransactionModel): Transaction {
    return new Transaction({
      id: model.id,
      userId: model.userId,
      amount: parseFloat(model.amount.toString()),
      type: model.type,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
