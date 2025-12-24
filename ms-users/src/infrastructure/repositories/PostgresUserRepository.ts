import { Pool } from 'pg';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class PostgresUserRepository implements UserRepository {
  constructor(private pool: Pool) {}

  async save(user: User): Promise<User> {
    const query = `
      INSERT INTO users (id, first_name, last_name, email, password, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.password,
      user.createdAt,
      user.updatedAt
    ];

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return User.restore({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      password: row.password,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, first_name, last_name, email, password, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return User.restore({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      password: row.password,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, first_name, last_name, email, password, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await this.pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return User.restore({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      password: row.password,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async findAll(): Promise<User[]> {
    const query = `
      SELECT id, first_name, last_name, email, password, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query);

    return result.rows.map((row: any) =>
      User.restore({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        password: row.password,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })
    );
  }

  async update(user: User): Promise<User> {
    const query = `
      UPDATE users 
      SET first_name = $2, last_name = $3, email = $4, password = $5, updated_at = $6
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.password,
      user.updatedAt
    ];

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return User.restore({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      password: row.password,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM users WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}