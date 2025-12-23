import type { FastifyInstance } from "fastify";
import { computeBalanceMinor } from "../domain/balance";

type TxSumRow = {
	type: "credit" | "debit";
	amount_minor: number;
};

export default async function balanceRoutes(app: FastifyInstance) {
	app.get(
		"/balance",
		{
			preHandler: [app.authenticate, app.walletReady],
			schema: {
				tags: ["wallet"],
				response: {
					200: { $ref: "BalanceResponse#" },
					401: { $ref: "ErrorResponse#" },
					503: { $ref: "ErrorResponse#" },
				},
			},
		},
		async (req) => {
			const userId = req.user.sub;
			const result = await app.db.query<TxSumRow>(
				`SELECT type, COALESCE(SUM(amount_minor), 0) AS amount_minor
         FROM transactions
         WHERE user_id = $1
         GROUP BY type`,
				[userId],
			);
			const balance = computeBalanceMinor(
				result.rows.map((row) => ({
					type: row.type,
					amountMinor: Number(row.amount_minor),
				})),
			);
			return { balanceMinor: balance };
		},
	);
}
