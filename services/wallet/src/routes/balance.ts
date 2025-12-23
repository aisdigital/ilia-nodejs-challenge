import type { FastifyInstance } from "fastify";

export default async function balanceRoutes(app: FastifyInstance) {
	app.get(
		"/balance",
		{
			preHandler: [app.authenticate, app.walletReady],
		},
		async () => {
			return { balanceMinor: 0 };
		},
	);
}
