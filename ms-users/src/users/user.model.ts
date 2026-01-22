import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  name: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'deleted_at' | 'created_at' | 'updated_at'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public name!: string;
  public deleted_at!: Date | null;
  public created_at!: Date;
  public updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: false, 
    indexes: [
      {
        unique: true,
        fields: ['email'],
        where: {
          deleted_at: null,
        },
      },
      {
        fields: ['deleted_at'],
      },
    ],
  }
);
