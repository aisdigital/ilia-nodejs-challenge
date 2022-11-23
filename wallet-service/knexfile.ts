import type { Knex } from "knex";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {

  development: {
    client: "postgresql",
    connection: {
      database: "postgres",
      user: "postgres",
      password: "password"
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
