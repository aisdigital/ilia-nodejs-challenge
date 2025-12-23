import fp from "fastify-plugin";
import { Pool } from "pg";
import { getConfig } from "../config";

declare module "fastify" {
  interface FastifyInstance {
    db: Pool;
  }
}

export default fp(async (app) => {
  const config = getConfig();
  if (!config.databaseUrl) {
    throw new Error("WALLET_DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString: config.databaseUrl });
  app.decorate("db", pool);

  app.addHook("onClose", async () => {
    await pool.end();
  });
});
