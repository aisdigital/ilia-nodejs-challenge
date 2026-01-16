import { Sequelize } from 'sequelize';
import { config } from '../../config';

export const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    logging: config.env === 'development' ? console.log : false,
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
    await sequelize.sync({ alter: config.env === 'development' });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};
