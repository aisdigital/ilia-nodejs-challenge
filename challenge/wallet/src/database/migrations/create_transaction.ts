import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTransactionEntity1634567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the transactions table
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isGenerated: true,
            generationStrategy: 'increment',
            isPrimary: true,
          },
          {
            name: 'amount',
            type: 'int',
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'walletId',
            type: 'int',
          },
        ],
      }),
      true
    );

    // Create a foreign key to establish the relationship with the wallets table
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['walletId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'wallets',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key and the transactions table
    await queryRunner.dropForeignKey('transactions', 'FK_walletId');
    await queryRunner.dropTable('transactions', true);
  }
}
