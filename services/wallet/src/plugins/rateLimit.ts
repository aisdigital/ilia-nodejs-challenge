import rateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";

type RateLimitConfig = {
	max: number;
	timeWindow: string;
};

const enabled =
	(process.env.RATE_LIMIT_ENABLED ?? "true").toLowerCase() !== "false";

function readInt(value: string | undefined, fallback: number): number {
	if (!value) {
		return fallback;
	}
	const parsed = Number.parseInt(value, 10);
	return Number.isNaN(parsed) ? fallback : parsed;
}

const txLimit: RateLimitConfig = {
	max: readInt(process.env.RL_TX_MAX, 30),
	timeWindow: process.env.RL_TX_WINDOW ?? "1 minute",
};

export const rateLimitConfig = {
	transactions: txLimit,
};

export default fp(async (app) => {
	if (!enabled) {
		return;
	}

	await app.register(rateLimit, {
		global: false,
	});
});
