import { describe, expect, it } from "bun:test";
import { readDeathCount } from "../src/consumer/headers";
import { nextRetryQueue } from "../src/consumer/retry";

describe("consumer retry ladder", () => {
	it("computes retries based on x-death counts", () => {
		expect(readDeathCount({})).toBe(0);
		expect(readDeathCount({ "x-death": [{ count: 1 }] })).toBe(1);
		expect(readDeathCount({ "x-death": [{ count: 1 }, { count: 2 }] })).toBe(3);
	});

	it("selects retry queues and ends at null", () => {
		expect(nextRetryQueue(0)).toBe("wallet.provision.retry.10s");
		expect(nextRetryQueue(1)).toBe("wallet.provision.retry.30s");
		expect(nextRetryQueue(2)).toBe("wallet.provision.retry.120s");
		expect(nextRetryQueue(3)).toBeNull();
	});
});
