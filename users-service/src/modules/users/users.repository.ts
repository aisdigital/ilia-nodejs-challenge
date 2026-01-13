import { pool } from "../../database/index.js";
import { User } from "./entities/user.entity.js";

export class UsersRepository {
  async create(user: User): Promise<void> {
    await pool.query(
      `
      INSERT INTO users (
        id, first_name, last_name, email, password_hash, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        user.id,
        user.firstName,
        user.lastName,
        user.email,
        user.passwordHash,
        user.createdAt,
      ]
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) return null;

    const row = result.rows[0];

    return new User(
      row.id,
      row.first_name,
      row.last_name,
      row.email,
      row.password_hash,
      row.created_at
    );
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) return null;

    const row = result.rows[0];

    return new User(
      row.id,
      row.first_name,
      row.last_name,
      row.email,
      row.password_hash,
      row.created_at
    );
  }
}
