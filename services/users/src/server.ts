import { buildApp } from "./app";
import { getConfig } from "./config";

async function start() {
  const config = getConfig();
  const app = buildApp();

  try {
    const address = await app.listen({ port: config.port, host: config.host });
    app.log.info({ address }, "users service listening");
  } catch (error) {
    app.log.error({ err: error }, "users service failed to start");
    process.exit(1);
  }
}

start();
