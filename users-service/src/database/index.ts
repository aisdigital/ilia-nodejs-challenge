import pg from "pg";

export const pool = new pg.Pool({
  host: "localhost",
  port: 5433,
  user: "postgres",
  password: "postgres",
  database: "users",
});
