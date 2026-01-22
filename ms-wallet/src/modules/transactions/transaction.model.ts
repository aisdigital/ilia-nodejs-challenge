import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

export enum TransactionType {
  CREDIT = 'CREDIT', 
  DEBIT = 'DEBIT',
}

export interface TransactionAttributes {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionCreationAttributes extends 
  Optional<TransactionAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Transaction extends Model
  <TransactionAttributes, TransactionCreationAttributes> 
  implements TransactionAttributes {
    declare id: string;
    declare user_id: string;
    declare amount: number;
    declare type: TransactionType;
    declare created_at: Date;
    declare updated_at: Date;
}

Transaction.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',    
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(TransactionType.CREDIT, TransactionType.DEBIT),
    allowNull: false,
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
  }, 
  {
  sequelize,
  tableName: 'transactions',
  timestamps: true,
  underscored: true,
    indexes: [
      { 
        fields: ['user_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['created_at']
      }
    ],
});