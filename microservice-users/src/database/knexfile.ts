import { Knex } from "knex";
import * as path from "path";
import { ConnectionOptions } from "tls";
import env from "../app.env";

let ssl: ConnectionOptions | boolean = env.DB_SSL;

if (ssl && env.DB_SSL_IGNORE_SERVER_IDENTITY) {
  ssl = {
    checkServerIdentity: () => undefined,
  };
}

const knexConfigs: Knex.Config = {
  client: "pg",
  connection: {
    host: env.DB_HOST,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    port: env.DB_PORT,
    pool: {
      testOnBorrow: true,
      min: env.DB_POOL_MIN,
      max: env.DB_POOL_MAX,
    },
    ssl,
  },
  migrations: {
    tableName: "migrations",
    directory: path.join(__dirname, "migrations"),
  },
  seeds: {
    timestampFilenamePrefix: false,
    directory: path.join(__dirname, "seeds"),
  },
};

export default Object.freeze(knexConfigs);
