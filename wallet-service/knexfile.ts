import type { Knex } from "knex";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {

  development: {
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: "./src/db/migrations",
      tableName: "knex_migrations"
    }
  }

};

module.exports = config;
