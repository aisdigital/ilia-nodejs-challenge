import { describe, expect, it } from "bun:test";
import amqplib from "amqplib";

const RUN = process.env.RUN_INTEGRATION === "true";
const RABBIT_URL =
	process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672";

async function waitForMessage(
	channel: amqplib.Channel,
	queue: string,
	attempts: number,
	delayMs: number,
) {
	for (let i = 0; i < attempts; i++) {
		const msg = await channel.get(queue, { noAck: false });
		if (msg) {
			return msg;
		}
		await new Promise((resolve) => setTimeout(resolve, delayMs));
	}
	return null;
}

if (RUN) {
	describe("consumer DLQ integration", () => {
		it("sends invalid payloads to DLQ", async () => {
			const conn = await amqplib.connect(RABBIT_URL);
			const channel = await conn.createChannel();

			// ensure DLQ exists and clean it
			await channel.assertQueue("wallet.provision.dlq", { durable: true });
			await channel.purgeQueue("wallet.provision.dlq");

			// publish invalid payload (missing userId)
			channel.publish(
				"domain.events",
				"user.registered",
				Buffer.from(JSON.stringify({ bad: true })),
				{ contentType: "application/json", persistent: true },
			);

			const dlqMessage = await waitForMessage(
				channel,
				"wallet.provision.dlq",
				20,
				500,
			);
			expect(dlqMessage).not.toBeNull();
			if (dlqMessage) {
				channel.ack(dlqMessage);
			}

			await channel.close();
			await conn.close();
		}, 40000);
	});
} else {
	describe.skip("consumer DLQ integration", () => {
		it("set RUN_INTEGRATION=true to run", () => {
			expect(true).toBeTrue();
		});
	});
}
