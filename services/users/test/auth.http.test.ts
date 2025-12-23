import { describe, expect, it } from "bun:test";

const base = process.env.USERS_BASE_URL ?? "http://localhost:3002";

describe("auth routes", () => {
	it("registers and logs in", async () => {
		const email = `test-${Date.now()}@example.com`;
		const password = "password123";
		const registerRes = await fetch(`${base}/v1/auth/register`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				name: "Tester",
				email,
				password,
			}),
		});
		expect(registerRes.status).toBe(201);
		const registerBody = await registerRes.json();
		expect(typeof registerBody.accessToken).toBe("string");
		expect(registerBody.user.email).toBe(email);

		const loginRes = await fetch(`${base}/v1/auth/login`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				email,
				password,
			}),
		});
		expect(loginRes.status).toBe(200);
		const loginBody = await loginRes.json();
		expect(typeof loginBody.accessToken).toBe("string");
	});

	it("rejects duplicate email", async () => {
		const email = `dup-${Date.now()}@example.com`;
		const password = "password123";
		const body = { name: "Dup", email, password };

		const first = await fetch(`${base}/v1/auth/register`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
		});
		expect(first.status).toBe(201);

		const second = await fetch(`${base}/v1/auth/register`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
		});
		expect(second.status).toBe(409);
	});

	it("rejects bad password length", async () => {
		const res = await fetch(`${base}/v1/auth/register`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				name: "BadPass",
				email: `bad-${Date.now()}@example.com`,
				password: "short",
			}),
		});
		expect(res.status).toBe(400);
	});
});
