import { describe, expect, it } from "bun:test";
import { parseUserRegistered } from "../src/domain/events";

describe("parseUserRegistered", () => {
	it("accepts valid payloads", () => {
		expect(parseUserRegistered({ userId: "user-123" })).toEqual({
			userId: "user-123",
		});
	});

	it("rejects invalid payloads", () => {
		expect(parseUserRegistered(null)).toBeNull();
		expect(parseUserRegistered({})).toBeNull();
		expect(parseUserRegistered({ userId: "" })).toBeNull();
	});
});
