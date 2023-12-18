import * as path from 'path';
import {
  DB_HOST,
  DB_LOGGING_LEVEL,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_URL,
  DB_USERNAME,
} from 'src/environments/database';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import * as connection from './connection';

type Connection = Omit<PostgresConnectionOptions, 'ssl'> & { ssl?: any };

const seeds: Connection = {
  type: 'postgres',
  name: 'seed',
  url: DB_URL,
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  logging: DB_LOGGING_LEVEL,
  migrations: [path.resolve(__dirname, 'seeds', '*')],
  entities: [path.resolve(__dirname, '..', '**', '*.entity{.ts,.js}')],
  cli: {
    migrationsDir: path.resolve(__dirname, 'seeds'),
  },
};

module.exports = [connection, seeds];
