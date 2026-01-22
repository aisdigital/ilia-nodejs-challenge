import { Sequelize } from "sequelize";
import { env } from "./env";
import { loggers, logError } from "../shared/utils/logger";

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  logging: env.NODE_ENV === 'development' ? (msg) => loggers.database.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  }
});

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    loggers.database.info({
      message: 'Database connected successfully',
      host: env.DB_HOST,
      database: env.DB_NAME,
    });
    
    if (env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      loggers.database.info('Database synchronized (development mode)');
    }
  } catch (error) {
    logError(error, 'database_connection');
    throw error;
  }
}
