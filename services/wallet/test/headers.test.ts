import { describe, expect, it } from "bun:test";
import { readDeathCount } from "../src/consumer/headers";

describe("readDeathCount", () => {
	it("returns 0 when header is missing", () => {
		expect(readDeathCount({})).toBe(0);
	});

	it("sums x-death counts", () => {
		const headers = {
			"x-death": [{ count: 1 }, { count: 2 }],
		};
		expect(readDeathCount(headers)).toBe(3);
	});
});
