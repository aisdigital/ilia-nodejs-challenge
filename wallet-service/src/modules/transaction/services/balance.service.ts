import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class BalanceService {
  private balanceSqlFragment = /* sql */ `
    COALESCE(
      SUM(
        CASE
          WHEN type = 'CREDIT' THEN amount
          WHEN type = 'DEBIT'  THEN -amount
          ELSE 0
        END
      ),
      0
    ) AS balance
  `;

  constructor(private readonly dataSource: DataSource) {}

  async getTotalBalance(): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const result = await queryRunner.query(/* sql */ `
        SELECT
          ${this.balanceSqlFragment}
        FROM transaction
        WHERE status = 'COMPLETED'
        `);

      return parseInt(result[0]?.balance || '0', 10);
    } finally {
      await queryRunner.release();
    }
  }

  async getUserBalance(
    queryRunner: QueryRunner,
    userId: string,
  ): Promise<number> {
    // FOR UPDATE doen't work with aggregations, so we use a subquery
    // to first lock the rows, then aggregate
    const result = await queryRunner.manager.query(
      /* sql */ `
        SELECT 
          ${this.balanceSqlFragment}
        FROM (
          SELECT type, amount
          FROM transaction
          WHERE user_id = $1 
            AND status = 'COMPLETED'
          FOR UPDATE
        ) AS locked_transactions
      `,
      [userId],
    );

    return parseInt(result[0]?.balance || '0', 10);
  }
}
