import { Transaction, TransactionOptions } from 'sequelize';
import { sequelize } from '../../config/database';

export type IsolationLevel = 
  | 'READ UNCOMMITTED' 
  | 'READ COMMITTED' 
  | 'REPEATABLE READ' 
  | 'SERIALIZABLE';

export interface TransactionManagerOptions {
  isolationLevel?: IsolationLevel;
}

export class TransactionManager {
  static async executeInTransaction<T>(
    callback: (transaction: Transaction) => Promise<T>,
    options?: TransactionManagerOptions
  ): Promise<T> {
    const transactionOptions: TransactionOptions = {};

    if (options?.isolationLevel) {
      transactionOptions.isolationLevel = options.isolationLevel as any;
    }

    return sequelize.transaction(transactionOptions, callback);
  }

  static async executeSerializable<T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    return this.executeInTransaction(callback, { 
      isolationLevel: 'SERIALIZABLE' 
    });
  }

  static async executeRepeatableRead<T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    return this.executeInTransaction(callback, { 
      isolationLevel: 'REPEATABLE READ' 
    });
  }
}
