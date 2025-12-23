import type { FastifyInstance } from "fastify";

export default async function transactionRoutes(app: FastifyInstance) {
	app.get(
		"/transactions",
		{
			preHandler: [app.authenticate, app.walletReady],
		},
		async () => {
			return { items: [] };
		},
	);

	app.post(
		"/transactions/credit",
		{
			preHandler: [app.authenticate, app.walletReady],
		},
		async () => {
			return { status: "pending" };
		},
	);

	app.post(
		"/transactions/debit",
		{
			preHandler: [app.authenticate, app.walletReady],
		},
		async () => {
			return { status: "pending" };
		},
	);
}
