import { Pool } from 'pg';
import { Transaction, TransactionType } from '../../domain/entities/Transaction';
import { TransactionRepository, TransactionFilters, Balance } from '../../domain/repositories/TransactionRepository';

export class PostgresTransactionRepository implements TransactionRepository {
  constructor(private pool: Pool) {}

  async save(transaction: Transaction): Promise<Transaction> {
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

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return Transaction.restore({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      type: row.type as TransactionType,
      createdAt: row.created_at
    });
  }

  async findByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
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

    const result = await this.pool.query(query, values);

    return result.rows.map(row =>
      Transaction.restore({
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        type: row.type as TransactionType,
        createdAt: row.created_at
      })
    );
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