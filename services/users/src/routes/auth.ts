import { randomUUID } from "node:crypto";
import * as bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { rateLimitConfig } from "../plugins/rateLimit";

type RegisterBody = {
	name: string;
	email: string;
	password: string;
};

type LoginBody = {
	email: string;
	password: string;
};

type UserRow = {
	id: string;
	name: string;
	email: string;
	password_hash: string;
	created_at: Date;
};

const accessTokenTtl = "1h";

function mapUser(row: UserRow) {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		createdAt: row.created_at.toISOString(),
	};
}

export default async function authRoutes(app: FastifyInstance) {
	app.post<{ Body: RegisterBody }>(
		"/register",
		{
			config: { rateLimit: rateLimitConfig.register },
			schema: {
				body: {
					type: "object",
					required: ["name", "email", "password"],
					properties: {
						name: { type: "string", minLength: 1 },
						email: { type: "string", format: "email" },
						password: { type: "string", minLength: 8 },
					},
				},
			},
		},
		async (req, reply) => {
			const { name, email, password } = req.body;
			const passwordHash = await bcrypt.hash(password, 10);
			const id = randomUUID();

			const client = await app.db.connect();
			try {
				await client.query("BEGIN");
				const result = await client.query<UserRow>(
					`INSERT INTO users (id, name, email, password_hash)
           VALUES ($1, $2, $3, $4)
           RETURNING id, name, email, password_hash, created_at`,
					[id, name, email, passwordHash],
				);
				const user = result.rows[0];
				await client.query(
					`INSERT INTO outbox (id, type, payload_json)
           VALUES ($1, $2, $3)`,
					[randomUUID(), "UserRegistered", { userId: user.id }],
				);
				await client.query("COMMIT");

				const accessToken = app.jwt.sign(
					{ sub: user.id },
					{ expiresIn: accessTokenTtl },
				);
				reply.code(201).send({
					user: mapUser(user),
					accessToken,
					expiresIn: accessTokenTtl,
				});
			} catch (error) {
				await client.query("ROLLBACK");
				const err = error as { code?: string };
				if (err.code === "23505") {
					reply.code(409).send({
						code: "EMAIL_EXISTS",
						message: "Email already registered",
					});
					return;
				}
				throw error;
			} finally {
				client.release();
			}
		},
	);

	app.post<{ Body: LoginBody }>(
		"/login",
		{
			config: { rateLimit: rateLimitConfig.login },
			schema: {
				body: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: { type: "string", format: "email" },
						password: { type: "string", minLength: 8 },
					},
				},
			},
		},
		async (req, reply) => {
			const { email, password } = req.body;
			const result = await app.db.query<UserRow>(
				"SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1",
				[email],
			);
			const user = result.rows[0];
			if (!user) {
				reply.code(401).send({
					code: "INVALID_CREDENTIALS",
					message: "Invalid credentials",
				});
				return;
			}

			const match = await bcrypt.compare(password, user.password_hash);
			if (!match) {
				reply.code(401).send({
					code: "INVALID_CREDENTIALS",
					message: "Invalid credentials",
				});
				return;
			}

			const accessToken = app.jwt.sign(
				{ sub: user.id },
				{ expiresIn: accessTokenTtl },
			);
			reply.send({ accessToken, expiresIn: accessTokenTtl });
		},
	);
}
