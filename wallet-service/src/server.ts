import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { runMigrations } from "./database/migrate.js";
import { startUserConsumer } from "./kafka/user.consumer.js";

async function start() {
  await runMigrations();

  const app = await buildApp();

  await startUserConsumer();

  await app.listen({
    port: env.PORT,
    host: "0.0.0.0",
  });

  console.log(`Wallet service running on port ${env.PORT}`);
}

start();
