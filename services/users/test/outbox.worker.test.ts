import { describe, expect, it } from "bun:test";
import { buildHeaders, mapRoutingKey } from "../src/workerHelpers";

describe("outbox publisher helpers", () => {
	it("maps known event type to routing key", () => {
		expect(mapRoutingKey("UserRegistered")).toBe("user.registered");
		expect(mapRoutingKey("Unknown")).toBeNull();
	});

	it("extracts request id header", () => {
		expect(buildHeaders({ requestId: "abc" })).toEqual({
			"x-request-id": "abc",
		});
		expect(buildHeaders({})).toBeUndefined();
		expect(buildHeaders(null)).toBeUndefined();
	});
});
