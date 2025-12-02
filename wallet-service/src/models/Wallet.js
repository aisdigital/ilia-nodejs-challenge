const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  tableName: 'wallets',
  timestamps: false,
  underscored: true,
});

module.exports = Wallet;

