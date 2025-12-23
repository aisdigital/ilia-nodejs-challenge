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
	describe.skip("wallet http integration", () => {
		it(reason, () => {
			expect(true).toBeTrue();
		});
	});
}

if (!RUN) {
	skipMessage("set RUN_INTEGRATION=true to run");
} else {
	describe("wallet http integration", () => {
		it("gates until wallet exists, then supports credit/debit/list/balance and rejects overdraft", async () => {
			const email = `wallet-${Date.now()}@example.com`;
			const password = "password123";

			// register -> get JWT
			const registerRes = await fetch(`${USERS_BASE}/v1/auth/register`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ name: "Wallet User", email, password }),
			});
			expect(registerRes.status).toBe(201);
			const registerBody = await registerRes.json();
			const token = registerBody.accessToken as string;
			expect(typeof token).toBe("string");
			const authHeader = { Authorization: `Bearer ${token}` };

			// initial gating: may be 503 or already 200
			const firstBalance = await fetch(`${WALLET_BASE}/v1/balance`, {
				headers: authHeader,
			});
			expect([503, 200]).toContain(firstBalance.status);

			// wait for wallet readiness
			await waitFor(
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

			// credit 500
			const creditRes = await fetch(`${WALLET_BASE}/v1/transactions/credit`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					...authHeader,
				},
				body: JSON.stringify({ amountMinor: 500 }),
			});
			expect(creditRes.status).toBe(201);

			// debit 200
			const debitRes = await fetch(`${WALLET_BASE}/v1/transactions/debit`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					...authHeader,
				},
				body: JSON.stringify({ amountMinor: 200 }),
			});
			expect(debitRes.status).toBe(201);

			// insufficient funds
			const overdraftRes = await fetch(`${WALLET_BASE}/v1/transactions/debit`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					...authHeader,
				},
				body: JSON.stringify({ amountMinor: 1000 }),
			});
			expect(overdraftRes.status).toBe(409);

			// balance should be 300
			const balanceRes = await fetch(`${WALLET_BASE}/v1/balance`, {
				headers: authHeader,
			});
			expect(balanceRes.status).toBe(200);
			const balanceBody = await balanceRes.json();
			expect(balanceBody.balanceMinor).toBe(300);

			// list transactions
			const listRes = await fetch(`${WALLET_BASE}/v1/transactions?limit=10`, {
				headers: authHeader,
			});
			expect(listRes.status).toBe(200);
			const listBody = await listRes.json();
			expect(Array.isArray(listBody.items)).toBe(true);
			expect(listBody.items.length).toBeGreaterThanOrEqual(2);
		}, 40000);

		it("returns 401 when JWT missing", async () => {
			const res = await fetch(`${WALLET_BASE}/v1/balance`);
			expect(res.status).toBe(401);
		});
	});
}
