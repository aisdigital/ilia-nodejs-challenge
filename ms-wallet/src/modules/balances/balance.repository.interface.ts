import { Transaction as SequelizeTransaction } from 'sequelize';
import { UserBalance } from './balance.model';

export interface IBalanceRepository {
  findByUserId(userId: string): Promise<UserBalance | null>;
  findByUserIdWithLock(userId: string, transaction: SequelizeTransaction): Promise<UserBalance | null>;
  create(userId: string, initialAmount?: number, transaction?: SequelizeTransaction): Promise<UserBalance>;
  updateBalance(
    userId: string, 
    newAmount: number, 
    transaction: SequelizeTransaction
  ): Promise<UserBalance>;
  incrementBalance(
    userId: string,
    amount: number,
    transaction: SequelizeTransaction
  ): Promise<void>;
  ensureBalance(userId: string, transaction?: SequelizeTransaction): Promise<UserBalance>;
}
