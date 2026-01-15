import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare password: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
    timestamps: true,
  }
);

export default UserModel;
