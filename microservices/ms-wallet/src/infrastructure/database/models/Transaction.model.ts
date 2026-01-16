import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

interface TransactionAttributes {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id'> {}

class TransactionModel
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes
{
  declare id: string;
  declare userId: string;
  declare amount: number;
  declare type: TransactionType;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TransactionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_id',
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    underscored: true,
    timestamps: true,
  }
);

export default TransactionModel;
