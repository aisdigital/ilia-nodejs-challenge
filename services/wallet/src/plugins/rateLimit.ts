import rateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";

const enabled = (process.env.RATE_LIMIT_ENABLED ?? "true").toLowerCase() !== "false";

export default fp(async (app) => {
  if (!enabled) {
    return;
  }

  await app.register(rateLimit, {
    global: false,
  });
});
