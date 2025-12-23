import { describe, expect, it } from "bun:test";
import { nextRetryQueue } from "../src/consumer/retry";

describe("nextRetryQueue", () => {
	it("returns tiered queues based on attempts", () => {
		expect(nextRetryQueue(0)).toBe("wallet.provision.retry.10s");
		expect(nextRetryQueue(1)).toBe("wallet.provision.retry.30s");
		expect(nextRetryQueue(2)).toBe("wallet.provision.retry.120s");
	});

	it("returns null after final retry tier", () => {
		expect(nextRetryQueue(3)).toBeNull();
		expect(nextRetryQueue(10)).toBeNull();
	});
});
