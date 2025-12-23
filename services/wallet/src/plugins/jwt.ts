import fastifyJwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config";

declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: { sub: string };
		user: { sub: string };
	}
}

declare module "fastify" {
	interface FastifyInstance {
		authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}
}

export default fp(async (app) => {
	const config = getConfig();
	await app.register(fastifyJwt, {
		secret: config.jwtPrivateKey,
	});

	app.decorate("authenticate", async (req, reply) => {
		try {
			await req.jwtVerify();
			if (!req.user?.sub) {
				return reply
					.code(401)
					.send({ code: "UNAUTHORIZED", message: "Unauthorized" });
			}
		} catch (error) {
			req.log.warn({ err: error }, "jwt verification failed");
			return reply
				.code(401)
				.send({ code: "UNAUTHORIZED", message: "Unauthorized" });
		}
	});
});
