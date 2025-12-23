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

function resolveIdempotencyKey(
	value: string | string[] | undefined,
): string | undefined {
	if (!value) return undefined;
	return Array.isArray(value) ? value[0] : value;
}

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
					503: { $ref: "ErrorResponse#" },
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
				headers: {
					type: "object",
					required: ["idempotency-key"],
					properties: {
						"idempotency-key": { type: "string", minLength: 1, maxLength: 128 },
					},
				},
				body: {
					type: "object",
					required: ["amountMinor"],
					properties: {
						amountMinor: { type: "integer", minimum: 1 },
						description: { type: "string" },
					},
				},
				response: {
					200: { $ref: "CreateTransactionResponse#" },
					201: { $ref: "CreateTransactionResponse#" },
					400: { $ref: "ErrorResponse#" },
					401: { $ref: "ErrorResponse#" },
					503: { $ref: "ErrorResponse#" },
				},
			},
		},
		async (req, reply) => {
			const userId = req.user.sub;
			const { amountMinor, description } = req.body;
			const idempotencyKey = resolveIdempotencyKey(
				req.headers["idempotency-key"],
			);
			if (!idempotencyKey) {
				reply.code(400).send({
					code: "MISSING_IDEMPOTENCY_KEY",
					message: "Idempotency-Key header is required",
				});
				return;
			}
			const id = randomUUID();

			const client = await app.db.connect();
			try {
				await client.query("BEGIN");
				const walletRow = await client.query(
					"SELECT id FROM wallets WHERE user_id = $1 FOR UPDATE",
					[userId],
				);
				if (walletRow.rowCount === 0) {
					await client.query("ROLLBACK");
					reply.header("Retry-After", "2");
					reply.code(503).send({
						code: "WALLET_PROVISIONING",
						message: "Wallet is being provisioned. Retry shortly.",
					});
					return;
				}

				const existing = await client.query<{ id: string }>(
					`SELECT id
           FROM transactions
           WHERE user_id = $1 AND idempotency_key = $2 AND type = 'credit'`,
					[userId, idempotencyKey],
				);
				if (existing.rowCount && existing.rows[0]) {
					await client.query("COMMIT");
					reply.code(200).send({ id: existing.rows[0].id, status: "recorded" });
					return;
				}

				await client.query(
					`INSERT INTO transactions (id, user_id, type, amount_minor, description, idempotency_key)
           VALUES ($1, $2, 'credit', $3, $4, $5)`,
					[id, userId, amountMinor, description ?? null, idempotencyKey],
				);

				await client.query("COMMIT");
				reply.code(201).send({ id, status: "recorded" });
			} catch (error) {
				await client.query("ROLLBACK");
				const err = error as { code?: string };
				if (err.code === "23505") {
					const existing = await client.query<{ id: string }>(
						`SELECT id
           FROM transactions
           WHERE user_id = $1 AND idempotency_key = $2 AND type = 'credit'`,
						[userId, idempotencyKey],
					);
					if (existing.rowCount && existing.rows[0]) {
						reply
							.code(200)
							.send({ id: existing.rows[0].id, status: "recorded" });
						return;
					}
				}
				throw error;
			} finally {
				client.release();
			}
		},
	);

	app.post<{ Body: CreateTxBody }>(
		"/transactions/debit",
		{
			preHandler: [app.authenticate, app.walletReady],
			config: { rateLimit: rateLimitConfig.transactions },
			schema: {
				tags: ["wallet"],
				headers: {
					type: "object",
					required: ["idempotency-key"],
					properties: {
						"idempotency-key": { type: "string", minLength: 1, maxLength: 128 },
					},
				},
				body: {
					type: "object",
					required: ["amountMinor"],
					properties: {
						amountMinor: { type: "integer", minimum: 1 },
						description: { type: "string" },
					},
				},
				response: {
					200: { $ref: "CreateTransactionResponse#" },
					201: { $ref: "CreateTransactionResponse#" },
					400: { $ref: "ErrorResponse#" },
					401: { $ref: "ErrorResponse#" },
					409: { $ref: "ErrorResponse#" },
					503: { $ref: "ErrorResponse#" },
				},
			},
		},
		async (req, reply) => {
			const userId = req.user.sub;
			const { amountMinor, description } = req.body;
			const idempotencyKey = resolveIdempotencyKey(
				req.headers["idempotency-key"],
			);
			if (!idempotencyKey) {
				reply.code(400).send({
					code: "MISSING_IDEMPOTENCY_KEY",
					message: "Idempotency-Key header is required",
				});
				return;
			}
			const id = randomUUID();

			const client = await app.db.connect();
			try {
				await client.query("BEGIN");
				const walletRow = await client.query(
					"SELECT id FROM wallets WHERE user_id = $1 FOR UPDATE",
					[userId],
				);
				if (walletRow.rowCount === 0) {
					await client.query("ROLLBACK");
					reply.header("Retry-After", "2");
					reply.code(503).send({
						code: "WALLET_PROVISIONING",
						message: "Wallet is being provisioned. Retry shortly.",
					});
					return;
				}

				const existing = await client.query<{ id: string }>(
					`SELECT id
           FROM transactions
           WHERE user_id = $1 AND idempotency_key = $2 AND type = 'debit'`,
					[userId, idempotencyKey],
				);
				if (existing.rowCount && existing.rows[0]) {
					await client.query("COMMIT");
					reply.code(200).send({ id: existing.rows[0].id, status: "recorded" });
					return;
				}

				const sums = await client.query<TxSumRow>(
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
					await client.query("ROLLBACK");
					reply.code(409).send({
						code: "INSUFFICIENT_FUNDS",
						message: "Insufficient balance",
					});
					return;
				}

				await client.query(
					`INSERT INTO transactions (id, user_id, type, amount_minor, description, idempotency_key)
           VALUES ($1, $2, 'debit', $3, $4, $5)`,
					[id, userId, amountMinor, description ?? null, idempotencyKey],
				);

				await client.query("COMMIT");
				reply.code(201).send({ id, status: "recorded" });
			} catch (error) {
				await client.query("ROLLBACK");
				const err = error as { code?: string };
				if (err.code === "23505") {
					const existing = await client.query<{ id: string }>(
						`SELECT id
           FROM transactions
           WHERE user_id = $1 AND idempotency_key = $2 AND type = 'debit'`,
						[userId, idempotencyKey],
					);
					if (existing.rowCount && existing.rows[0]) {
						reply
							.code(200)
							.send({ id: existing.rows[0].id, status: "recorded" });
						return;
					}
				}
				throw error;
			} finally {
				client.release();
			}
		},
	);
}
