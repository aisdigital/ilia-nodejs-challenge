import { describe, expect, it } from "bun:test";
import { canDebit, computeBalanceMinor } from "../src/domain/balance";

describe("computeBalanceMinor", () => {
	it("sums credits and debits", () => {
		const balance = computeBalanceMinor([
			{ type: "credit", amountMinor: 1000 },
			{ type: "debit", amountMinor: 250 },
			{ type: "credit", amountMinor: 100 },
		]);
		expect(balance).toBe(850);
	});
});

describe("canDebit", () => {
	it("returns true when balance stays non-negative", () => {
		expect(canDebit(500, 200)).toBe(true);
	});

	it("returns false when debit would go negative", () => {
		expect(canDebit(300, 500)).toBe(false);
	});
});
