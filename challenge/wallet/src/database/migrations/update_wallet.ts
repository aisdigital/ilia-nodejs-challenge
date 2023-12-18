import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class UpdateWalletEntity1634556789000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the new column for the relationship
    await queryRunner.addColumn(
      'wallets',
      new TableColumn({
        name: 'user_id',
        type: 'int',
        isNullable: true, // Set to false if you want to make it mandatory
      })
    );

    // Create a foreign key to establish the relationship
    await queryRunner.createForeignKey(
      'wallets',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users', // Make sure to use the actual table name for the User entity
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key and column
    await queryRunner.dropForeignKey('wallets', 'FK_user_id');
    await queryRunner.dropColumn('wallets', 'user_id');
  }
}
