import { pool } from "../../database/index.js";
import { Transaction } from "./entities/transaction.entity.js";
import { Wallet } from "./entities/wallet.entity.js";
import { TransactionType } from "./entities/transaction.entity.js";

export class WalletRepository {
  async createWallet(wallet: Wallet): Promise<void> {
    await pool.query(
      `
      INSERT INTO wallets (id, user_id, balance, created_at)
      VALUES ($1, $2, $3, $4)
      `,
      [wallet.id, wallet.userId, wallet.balance, wallet.createdAt]
    );
  }

  async findWalletByUser(userId: string): Promise<Wallet | null> {
    const result = await pool.query(
      `SELECT * FROM wallets WHERE user_id = $1`,
      [userId]
    );

    if (result.rowCount === 0) return null;

    const row = result.rows[0];
    return new Wallet(row.id, row.user_id, Number(row.balance), row.created_at);
  }

  async updateWalletBalance(walletId: string, balance: number): Promise<void> {
    await pool.query(
      `UPDATE wallets SET balance = $1 WHERE id = $2`,
      [balance, walletId]
    );
  }

  async createTransaction(transaction: Transaction): Promise<void> {
    await pool.query(
      `
      INSERT INTO transactions (id, wallet_id, type, amount, description, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        transaction.id,
        transaction.walletId,
        transaction.type,
        transaction.amount,
        transaction.description,
        transaction.createdAt,
      ]
    );
  }

  async findTransactionsByWallet(
    walletId: string,
    type?: TransactionType
  ): Promise<Transaction[]> {
    const params: any[] = [walletId];
    let sql = `SELECT * FROM transactions WHERE wallet_id = $1`;

    if (type) {
      params.push(type);
      sql += ` AND type = $2`;
    }

    const result = await pool.query(sql, params);

    return result.rows.map(
      (row) =>
        new Transaction(
          row.id,
          row.wallet_id,
          row.type,
          Number(row.amount),
          row.description ?? "",
          row.created_at
        )
    );
  }

  async getBalanceByUser(userId: string): Promise<number> {
    const result = await pool.query(
      `
      SELECT COALESCE(
        SUM(
          CASE
            WHEN t.type = 'CREDIT' THEN t.amount
            ELSE -t.amount
          END
        ), 0
      ) AS balance
      FROM transactions t
      JOIN wallets w ON w.id = t.wallet_id
      WHERE w.user_id = $1
      `,
      [userId]
    );

    return Number(result.rows[0].balance);
  }
}
