import amqplib from "amqplib";
import { Pool } from "pg";
import { getConfig } from "./config";

const EXCHANGE = "domain.events";
const ROUTING_KEY = "user.registered";

type OutboxRow = {
	id: string;
	type: string;
	payload_json: unknown;
};

function mapRoutingKey(type: string): string | null {
	if (type === "UserRegistered") {
		return ROUTING_KEY;
	}
	return null;
}

async function publishBatch(pool: Pool, channel: amqplib.ConfirmChannel) {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const result = await client.query<OutboxRow>(
			`SELECT id, type, payload_json
       FROM outbox
       WHERE status = 'pending'
       ORDER BY created_at
       LIMIT 20
       FOR UPDATE SKIP LOCKED`,
		);

		if (result.rowCount === 0) {
			await client.query("COMMIT");
			return 0;
		}

		for (const row of result.rows) {
			const routingKey = mapRoutingKey(row.type);
			if (!routingKey) {
				await client.query(
					"UPDATE outbox SET status = 'failed', last_error = $2 WHERE id = $1",
					[row.id, "unknown event type"],
				);
				continue;
			}

			channel.publish(
				EXCHANGE,
				routingKey,
				Buffer.from(JSON.stringify(row.payload_json)),
				{
					persistent: true,
					contentType: "application/json",
				},
			);

			await channel.waitForConfirms();

			await client.query(
				"UPDATE outbox SET status = 'published', published_at = NOW() WHERE id = $1",
				[row.id],
			);
		}

		await client.query("COMMIT");
		return result.rowCount ?? 0;
	} catch (error) {
		await client.query("ROLLBACK");
		const err = error as Error;
		await client.query(
			"UPDATE outbox SET attempts = attempts + 1, last_error = $1 WHERE status = 'pending'",
			[err.message],
		);
		throw error;
	} finally {
		client.release();
	}
}

async function start() {
	const config = getConfig();
	if (!config.rabbitUrl) {
		throw new Error("RABBITMQ_URL is required");
	}
	if (!config.databaseUrl) {
		throw new Error("USERS_DATABASE_URL is required");
	}

	const pool = new Pool({ connectionString: config.databaseUrl });
	const conn = await amqplib.connect(config.rabbitUrl);
	const channel = await conn.createConfirmChannel();
	await channel.assertExchange(EXCHANGE, "topic", { durable: true });

	const pollIntervalMs = Number.parseInt(
		process.env.OUTBOX_POLL_INTERVAL_MS ?? "1000",
		10,
	);
	const interval = Number.isNaN(pollIntervalMs) ? 1000 : pollIntervalMs;

	const shutdown = async () => {
		await channel.close();
		await conn.close();
		await pool.end();
	};

	process.on("SIGINT", () => void shutdown().finally(() => process.exit(0)));
	process.on("SIGTERM", () => void shutdown().finally(() => process.exit(0)));

	setInterval(() => {
		publishBatch(pool, channel).catch((error) => {
			console.error("outbox publish failed", error);
		});
	}, interval);
}

start().catch((error) => {
	console.error("users publisher failed", error);
	process.exit(1);
});
