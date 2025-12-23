import { describe, expect, it } from "bun:test";

const RUN = process.env.RUN_INTEGRATION === "true";
const USERS_BASE = process.env.USERS_BASE_URL ?? "http://localhost:3002";
const WALLET_BASE = process.env.WALLET_BASE_URL ?? "http://localhost:3001";

async function waitFor<T>(
	fn: () => Promise<T>,
	attempts: number,
	delayMs: number,
) {
	for (let i = 0; i < attempts; i++) {
		try {
			return await fn();
		} catch (error) {
			if (i === attempts - 1) throw error;
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}
	throw new Error("waitFor exhausted");
}

function skipMessage(reason: string) {
	describe.skip("integration register → wallet", () => {
		it(reason, () => {
			expect(true).toBeTrue();
		});
	});
}

if (!RUN) {
	skipMessage("set RUN_INTEGRATION=true to run");
} else {
	describe("integration register → wallet", () => {
		it("registers a user, sees 503 then 200 on wallet balance (happy path)", async () => {
			const registerRes = await fetch(`${USERS_BASE}/v1/auth/register`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					name: "Integration User",
					email: `int-${Date.now()}@test.dev`,
					password: "password123",
				}),
			});
			expect(registerRes.status).toBe(201);
			const registerBody = await registerRes.json();
			const token = registerBody.accessToken;
			expect(typeof token).toBe("string");

			const authHeader = { Authorization: `Bearer ${token}` };

			const firstBalance = await fetch(`${WALLET_BASE}/v1/balance`, {
				headers: authHeader,
			});
			expect([503, 200]).toContain(firstBalance.status);

			const balance200 = await waitFor(
				async () => {
					const res = await fetch(`${WALLET_BASE}/v1/balance`, {
						headers: authHeader,
					});
					if (res.status !== 200) {
						throw new Error(`status ${res.status}`);
					}
					return res;
				},
				10,
				500,
			);
			expect(balance200.status).toBe(200);
			const balanceBody = await balance200.json();
			expect(typeof balanceBody.balanceMinor).toBe("number");
		}, 30000);

		it("fails with 401 when JWT is missing", async () => {
			const res = await fetch(`${WALLET_BASE}/v1/balance`);
			expect(res.status).toBe(401);
		});
	});
}
