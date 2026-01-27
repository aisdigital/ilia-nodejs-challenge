import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

export interface IdempotencyKeyAttributes {
  id: string;
  key: string;
  user_id: string;
  request_path: string;
  request_body: object | null;
  response_status: number | null;
  response_body: object | null;
  created_at: Date;
  expires_at: Date;
}

export interface IdempotencyKeyCreationAttributes extends 
  Optional<IdempotencyKeyAttributes, 'id' | 'request_body' | 'response_status' | 'response_body' | 'created_at'> {}

export class IdempotencyKey extends Model<IdempotencyKeyAttributes, IdempotencyKeyCreationAttributes>
  implements IdempotencyKeyAttributes {
    declare id: string;
    declare key: string;
    declare user_id: string;
    declare request_path: string;
    declare request_body: object | null;
    declare response_status: number | null;
    declare response_body: object | null;
    declare created_at: Date;
    declare expires_at: Date;
}

IdempotencyKey.init({
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
    field: 'created_at',
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'idempotency_keys',
  timestamps: false, 
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['key'],
      name: 'idx_idempotency_key',
    },
    {
      fields: ['expires_at'],
      name: 'idx_idempotency_expires',
    },
    {
      fields: ['user_id'],
      name: 'idx_idempotency_user_id',
    },
  ],
});
