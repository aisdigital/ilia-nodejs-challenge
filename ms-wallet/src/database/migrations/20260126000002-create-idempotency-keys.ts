import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('idempotency_keys', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      request_path: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      request_body: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      response_status: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      response_body: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('idempotency_keys', ['key'], {
      unique: true,
      name: 'idx_idempotency_key',
    });

    await queryInterface.addIndex('idempotency_keys', ['expires_at'], {
      name: 'idx_idempotency_expires',
    });

    await queryInterface.addIndex('idempotency_keys', ['user_id'], {
      name: 'idx_idempotency_user_id',
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('idempotency_keys');
  },
};
