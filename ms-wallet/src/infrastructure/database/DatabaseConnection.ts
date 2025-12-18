import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      console.error('Database connection error:', err);
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  public async initialize(): Promise<void> {
    try {
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL CHECK (amount > 0),
        type VARCHAR(10) NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createUserIdIndex = `
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)
    `;

    const createCreatedAtIndex = `
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)
    `;

    await this.pool.query(createTransactionsTable);
    await this.pool.query(createUserIdIndex);
    await this.pool.query(createCreatedAtIndex);
  }
}