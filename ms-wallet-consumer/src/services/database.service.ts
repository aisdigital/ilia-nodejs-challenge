import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../config/database.config';

export class DatabaseService {
  private static instance: DataSource;

  static async getConnection(): Promise<DataSource> {
    if (!this.instance) {
      const config = getDatabaseConfig();

      this.instance = new DataSource({
        type: 'postgres',
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password,
        database: config.database,
        entities: [],
        synchronize: false,
        logging: false,
      });

      await this.instance.initialize();
      console.log('Database connection established');
    }

    return this.instance;
  }

  static async closeConnection(): Promise<void> {
    if (this.instance && this.instance.isInitialized) {
      await this.instance.destroy();
      console.log('Database connection closed');
    }
  }
}
