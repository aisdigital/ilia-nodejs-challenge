import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

export interface UserBalanceAttributes {
  id: string;
  user_id: string;
  amount: number;
  version: number; 
  created_at: Date;
  updated_at: Date;
}

export interface UserBalanceCreationAttributes extends 
  Optional<UserBalanceAttributes, 'id' | 'amount' | 'version' | 'created_at' | 'updated_at'> {}

export class UserBalance extends Model<UserBalanceAttributes, UserBalanceCreationAttributes> 
  implements UserBalanceAttributes {
    declare id: string;
    declare user_id: string;
    declare amount: number;
    declare version: number;
    declare created_at: Date;
    declare updated_at: Date;
}

UserBalance.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id',
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  sequelize,
  tableName: 'user_balances',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id'],
    },
  ],
});
