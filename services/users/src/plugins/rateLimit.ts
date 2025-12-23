import rateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";

type RateLimitConfig = {
  max: number;
  timeWindow: string;
};

const enabled = (process.env.RATE_LIMIT_ENABLED ?? "true").toLowerCase() !== "false";

function readInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

const registerLimit: RateLimitConfig = {
  max: readInt(process.env.RL_REGISTER_MAX, 5),
  timeWindow: process.env.RL_REGISTER_WINDOW ?? "1 minute",
};

const loginLimit: RateLimitConfig = {
  max: readInt(process.env.RL_LOGIN_MAX, 10),
  timeWindow: process.env.RL_LOGIN_WINDOW ?? "1 minute",
};

export const rateLimitConfig = {
  register: registerLimit,
  login: loginLimit,
};

export default fp(async (app) => {
  if (!enabled) {
    return;
  }

  await app.register(rateLimit, {
    global: false,
  });
});
