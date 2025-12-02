const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  walletId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'wallet_id',
    references: {
      model: 'wallets',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.STRING(50),
    enum: ['DEBIT', 'CREDIT'],
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  tableName: 'transactions',
  timestamps: false,
  underscored: true,
});

module.exports = Transaction;

