import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'wallet_db',
  process.env.DB_USER || 'wallet_user',
  process.env.DB_PASSWORD || 'wallet_pass',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};
