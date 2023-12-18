import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWalletTable1629457737274 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          {
            name: 'id',
            type: 'int',
            isGenerated: true,
            generationStrategy: 'increment',
            isPrimary: true,
          },
          {
            name: 'balance',
            type: 'int',
            default: 0,
          },
        ],
      }),
      true
    );

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
    await queryRunner.dropTable('wallets', true);
  }
}
