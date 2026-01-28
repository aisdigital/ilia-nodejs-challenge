import { Transaction as SequelizeTransaction } from 'sequelize';
import { UserBalance } from './balance.model';
import { IBalanceRepository } from './balance.repository.interface';
import { sequelize } from '../../config/database';

export class BalanceRepository implements IBalanceRepository {

  async findByUserId(userId: string): Promise<UserBalance | null> {
    return UserBalance.findOne({
      where: { user_id: userId },
    });
  }

  async findByUserIdWithLock(
    userId: string, 
    transaction: SequelizeTransaction
  ): Promise<UserBalance | null> {
    return UserBalance.findOne({
      where: { user_id: userId },
      lock: transaction.LOCK.UPDATE, 
      transaction,
    });
  }

  async create(
    userId: string, 
    initialAmount: number = 0,
    transaction?: SequelizeTransaction
  ): Promise<UserBalance> {
    return UserBalance.create(
      {
        user_id: userId,
        amount: initialAmount,
        version: 1,
      },
      { transaction }
    );
  }

  async updateBalance(
    userId: string,
    newAmount: number,
    transaction: SequelizeTransaction
  ): Promise<UserBalance> {
    const [affectedCount, affectedRows] = await UserBalance.update(
      { 
        amount: newAmount,
        version: sequelize.literal('version + 1') as any,
      },
      {
        where: { user_id: userId },
        transaction,
        returning: true,
      }
    );

    if (affectedCount === 0) {
      throw new Error(`Balance record not found for user ${userId}`);
    }

    return affectedRows[0];
  }

  async incrementBalance(
    userId: string,
    amount: number, 
    transaction: SequelizeTransaction
  ): Promise<void> {
    const [affectedCount] = await UserBalance.update(
      {
        amount: sequelize.literal(`amount + ${amount}`) as any,
        version: sequelize.literal('version + 1') as any,
      },
      {
        where: { user_id: userId },
        transaction,
      }
    );

    if (affectedCount === 0) {
      throw new Error(`Balance record not found for user ${userId}`);
    }
  }

  async ensureBalance(
    userId: string,
    transaction?: SequelizeTransaction
  ): Promise<UserBalance> {
    const existing = await UserBalance.findOne({
      where: { user_id: userId },
      transaction,
    });

    if (existing) {
      return existing;
    }

    const [balance] = await UserBalance.upsert(
      {
        user_id: userId,
        amount: 0,
        version: 1,
      },
      { 
        transaction,
        returning: true,
      }
    );

    return balance;
  }
}
