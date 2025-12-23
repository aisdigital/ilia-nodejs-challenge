import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { canDebit, computeBalanceMinor } from "../domain/balance";
import { rateLimitConfig } from "../plugins/rateLimit";

type CreateTxBody = {
	amountMinor: number;
	description?: string;
};

type TxRow = {
	id: string;
	type: "credit" | "debit";
	amount_minor: number;
	description: string | null;
	created_at: Date;
};

type TxSumRow = {
	type: "credit" | "debit";
	amount_minor: number;
};

export default async function transactionRoutes(app: FastifyInstance) {
	app.get(
		"/transactions",
		{
			preHandler: [app.authenticate, app.walletReady],
			schema: {
				tags: ["wallet"],
				querystring: {
					type: "object",
					properties: {
						limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
						cursor: { type: "string" },
					},
				},
				response: {
					200: { $ref: "TransactionsPage#" },
					401: { $ref: "ErrorResponse#" },
				},
			},
		},
		async (req) => {
			const userId = req.user.sub;
			const limit = typeof req.query.limit === "number" ? req.query.limit : 20;
			const cursor =
				typeof req.query.cursor === "string" ? req.query.cursor : undefined;

			const params: Array<string | number> = [userId, limit];
			const cursorClause = cursor ? "AND created_at < $3" : "";
			if (cursor) {
				params.push(cursor);
			}

			const result = await app.db.query<TxRow>(
				`SELECT id, type, amount_minor, description, created_at
         FROM transactions
         WHERE user_id = $1 ${cursorClause}
         ORDER BY created_at DESC
         LIMIT $2`,
				params,
			);

			const items = result.rows.map((row) => ({
				id: row.id,
				type: row.type,
				amountMinor: Number(row.amount_minor),
				description: row.description ?? undefined,
				createdAt: row.created_at.toISOString(),
			}));

			const nextCursor = result.rows.at(-1)?.created_at.toISOString();
			return { items, nextCursor };
		},
	);

	app.post<{ Body: CreateTxBody }>(
		"/transactions/credit",
		{
			preHandler: [app.authenticate, app.walletReady],
			config: { rateLimit: rateLimitConfig.transactions },
			schema: {
				tags: ["wallet"],
				body: {
					type: "object",
					required: ["amountMinor"],
					properties: {
						amountMinor: { type: "integer", minimum: 1 },
						description: { type: "string" },
					},
				},
				response: {
					201: { $ref: "CreateTransactionResponse#" },
					401: { $ref: "ErrorResponse#" },
				},
			},
		},
		async (req, reply) => {
			const userId = req.user.sub;
			const { amountMinor, description } = req.body;
			const id = randomUUID();

			await app.db.query(
				`INSERT INTO transactions (id, user_id, type, amount_minor, description)
         VALUES ($1, $2, 'credit', $3, $4)`,
				[id, userId, amountMinor, description ?? null],
			);

			reply.code(201).send({ id, status: "recorded" });
		},
	);

	app.post<{ Body: CreateTxBody }>(
		"/transactions/debit",
		{
			preHandler: [app.authenticate, app.walletReady],
			config: { rateLimit: rateLimitConfig.transactions },
			schema: {
				tags: ["wallet"],
				body: {
					type: "object",
					required: ["amountMinor"],
					properties: {
						amountMinor: { type: "integer", minimum: 1 },
						description: { type: "string" },
					},
				},
				response: {
					201: { $ref: "CreateTransactionResponse#" },
					401: { $ref: "ErrorResponse#" },
					409: { $ref: "ErrorResponse#" },
				},
			},
		},
		async (req, reply) => {
			const userId = req.user.sub;
			const { amountMinor, description } = req.body;
			const id = randomUUID();

			const sums = await app.db.query<TxSumRow>(
				`SELECT type, COALESCE(SUM(amount_minor), 0) AS amount_minor
         FROM transactions
         WHERE user_id = $1
         GROUP BY type`,
				[userId],
			);
			const balance = computeBalanceMinor(
				sums.rows.map((row) => ({
					type: row.type,
					amountMinor: Number(row.amount_minor),
				})),
			);

			if (!canDebit(balance, amountMinor)) {
				reply.code(409).send({
					code: "INSUFFICIENT_FUNDS",
					message: "Insufficient balance",
				});
				return;
			}

			await app.db.query(
				`INSERT INTO transactions (id, user_id, type, amount_minor, description)
         VALUES ($1, $2, 'debit', $3, $4)`,
				[id, userId, amountMinor, description ?? null],
			);

			reply.code(201).send({ id, status: "recorded" });
		},
	);
}
