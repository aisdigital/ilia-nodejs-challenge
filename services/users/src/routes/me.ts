import type { FastifyInstance } from "fastify";

type UserRow = {
	id: string;
	name: string;
	email: string;
	created_at: Date;
};

function mapUser(row: UserRow) {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		createdAt: row.created_at.toISOString(),
	};
}

export default async function meRoutes(app: FastifyInstance) {
	app.get(
		"/me",
		{
			preHandler: app.authenticate,
			schema: {
				tags: ["users"],
				response: {
					200: {
						type: "object",
						properties: {
							user: { $ref: "User#" },
						},
					},
					401: { $ref: "ErrorResponse#" },
					404: { $ref: "ErrorResponse#" },
				},
			},
		},
		async (req, reply) => {
			const userId = req.user.sub;
			const result = await app.db.query<UserRow>(
				"SELECT id, name, email, created_at FROM users WHERE id = $1",
				[userId],
			);
			const user = result.rows[0];
			if (!user) {
				reply
					.code(404)
					.send({ code: "USER_NOT_FOUND", message: "User not found" });
				return;
			}
			reply.send({ user: mapUser(user) });
		},
	);
}
