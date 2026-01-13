import pg from "pg";

export const pool = new pg.Pool({
  host: "localhost",
  port: 5434,
  user: "postgres",
  password: "postgres",
  database: "wallet",
});