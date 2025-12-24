import { Pool } from 'pg';
import { Transaction, TransactionType } from '../../domain/entities/Transaction';
import { TransactionRepository, TransactionFilters, Balance } from '../../domain/repositories/TransactionRepository';
import { Logger } from '../logging/Logger';

export class PostgresTransactionRepository implements TransactionRepository {
  constructor(private pool: Pool) {}

  async save(transaction: Transaction): Promise<Transaction> {
    try {
      const query = `
        INSERT INTO transactions (id, user_id, amount, type, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [
        transaction.id,
        transaction.userId,
        transaction.amount,
        transaction.type,
        transaction.createdAt
      ];

      Logger.getInstance().info('PostgresTransactionRepository: Executing database query', {
        query: query.replace(/\s+/g, ' ').trim(),
        values: values.map((v, i) => ({ [`$${i+1}`]: v }))
      });

      const result = await this.pool.query(query, values);
      const row = result.rows[0];

      Logger.getInstance().info('PostgresTransactionRepository: Query executed successfully', {
        rowsAffected: result.rowCount,
        returnedData: row
      });

      return Transaction.restore({
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        type: row.type as TransactionType,
        createdAt: row.created_at
      });
    } catch (error) {
      Logger.getInstance().error('PostgresTransactionRepository: Database error during save', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorCode: (error as any)?.code,
        errorDetail: (error as any)?.detail,
        errorHint: (error as any)?.hint,
        transactionData: {
          id: transaction.id,
          userId: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          createdAt: transaction.createdAt
        }
      });
      throw error;
    }
  }

  async findByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      let query = `
        SELECT id, user_id, amount, type, created_at
        FROM transactions
        WHERE user_id = $1
      `;
      
      const values: any[] = [userId];
      let paramIndex = 2;

      if (filters?.type) {
        query += ` AND type = $${paramIndex}`;
        values.push(filters.type);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      Logger.getInstance().info('PostgresTransactionRepository: Executing findByUserId query', {
        query: query.replace(/\s+/g, ' ').trim(),
        values: values.map((v, i) => ({ [`$${i+1}`]: v })),
        userId,
        filters
      });

      const result = await this.pool.query(query, values);

      Logger.getInstance().info('PostgresTransactionRepository: Query executed for findByUserId', {
        userId,
        rowCount: result.rowCount,
        foundTransactions: result.rows.length,
        rawRows: result.rows
      });

      const transactions = result.rows.map(row =>
        Transaction.restore({
          id: row.id,
          userId: row.user_id,
          amount: row.amount,
          type: row.type as TransactionType,
          createdAt: row.created_at
        })
      );

      Logger.getInstance().info('PostgresTransactionRepository: Transactions mapped successfully', {
        userId,
        mappedCount: transactions.length,
        mappedTransactions: transactions.map(t => ({
          id: t.id,
          userId: t.userId,
          amount: t.amount,
          type: t.type,
          createdAt: t.createdAt
        }))
      });

      return transactions;
    } catch (error) {
      Logger.getInstance().error('PostgresTransactionRepository: Error in findByUserId', {
        userId,
        filters,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorCode: (error as any)?.code,
        errorDetail: (error as any)?.detail
      });
      throw error;
    }
  }

  async getBalance(userId: string): Promise<Balance> {
    const query = `
      SELECT 
        COALESCE(
          SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END),
          0
        ) as balance
      FROM transactions
      WHERE user_id = $1
    `;

    const result = await this.pool.query(query, [userId]);
    const balance = parseInt(result.rows[0].balance) || 0;

    return { amount: balance };
  }
}