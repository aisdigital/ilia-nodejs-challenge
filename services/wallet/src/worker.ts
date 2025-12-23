import amqplib, { type ConsumeMessage } from "amqplib";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { getConfig } from "./config";

const EXCHANGE = "domain.events";
const DLX = "domain.events.dlx";
const ROUTING_KEY = "user.registered";
const QUEUE = "wallet.provision";
const DLQ = "wallet.provision.dlq";

type UserRegistered = {
  userId: string;
};

function readDeathCount(message: ConsumeMessage): number {
  const headers = message.properties.headers ?? {};
  const deaths = headers["x-death"];
  if (!Array.isArray(deaths)) {
    return 0;
  }
  const total = deaths.reduce((sum, entry) => {
    if (entry && typeof entry === "object" && typeof entry.count === "number") {
      return sum + entry.count;
    }
    return sum;
  }, 0);
  return total;
}

function nextRetryQueue(attempts: number): string | null {
  if (attempts <= 0) return "wallet.provision.retry.10s";
  if (attempts === 1) return "wallet.provision.retry.30s";
  if (attempts === 2) return "wallet.provision.retry.120s";
  return null;
}

function parsePayload(message: ConsumeMessage): UserRegistered | null {
  try {
    const payload = JSON.parse(message.content.toString("utf8"));
    if (!payload || typeof payload.userId !== "string" || payload.userId.trim() === "") {
      return null;
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

async function ensureTopology(channel: amqplib.Channel, retryTtls: [number, number, number]) {
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  await channel.assertExchange(DLX, "topic", { durable: true });

  await channel.assertQueue(QUEUE, {
    durable: true,
    deadLetterExchange: DLX,
    deadLetterRoutingKey: DLQ,
  });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

  await channel.assertQueue(DLQ, { durable: true });
  await channel.bindQueue(DLQ, DLX, DLQ);
  await channel.bindQueue(DLQ, DLX, ROUTING_KEY);

  const retryQueues = [
    { name: "wallet.provision.retry.10s", ttl: retryTtls[0] },
    { name: "wallet.provision.retry.30s", ttl: retryTtls[1] },
    { name: "wallet.provision.retry.120s", ttl: retryTtls[2] },
  ];

  for (const retry of retryQueues) {
    await channel.assertQueue(retry.name, {
      durable: true,
      messageTtl: retry.ttl,
      deadLetterExchange: EXCHANGE,
      deadLetterRoutingKey: ROUTING_KEY,
    });
  }
}

async function start() {
  const config = getConfig();
  if (!config.rabbitUrl) {
    throw new Error("RABBITMQ_URL is required");
  }
  if (!config.databaseUrl) {
    throw new Error("WALLET_DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString: config.databaseUrl });
  const conn = await amqplib.connect(config.rabbitUrl);
  const channel = await conn.createChannel();
  await channel.prefetch(5);
  await ensureTopology(channel, config.retryTtlMs);

  const shutdown = async () => {
    await channel.close();
    await conn.close();
    await pool.end();
  };

  process.on("SIGINT", () => void shutdown().finally(() => process.exit(0)));
  process.on("SIGTERM", () => void shutdown().finally(() => process.exit(0)));

  await channel.consume(
    QUEUE,
    async (message) => {
      if (!message) {
        return;
      }
      const payload = parsePayload(message);
      if (!payload) {
        channel.nack(message, false, false);
        return;
      }

      try {
        await pool.query(
          `INSERT INTO wallets (id, user_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id) DO NOTHING`,
          [randomUUID(), payload.userId],
        );
        channel.ack(message);
      } catch (error) {
        const attempts = readDeathCount(message);
        const retryQueue = nextRetryQueue(attempts);
        if (retryQueue) {
          channel.sendToQueue(retryQueue, message.content, {
            contentType: "application/json",
            persistent: true,
          });
          channel.ack(message);
        } else {
          channel.nack(message, false, false);
        }
      }
    },
    { noAck: false },
  );
}

start().catch((error) => {
  console.error("wallet consumer failed", error);
  process.exit(1);
});
