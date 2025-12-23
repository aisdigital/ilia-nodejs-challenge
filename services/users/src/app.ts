import { randomUUID } from "node:crypto";
import * as net from "node:net";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyInstance } from "fastify";
import { getConfig } from "./config";
import dbPlugin from "./plugins/db";
import jwtPlugin from "./plugins/jwt";
import rateLimitPlugin from "./plugins/rateLimit";
import authRoutes from "./routes/auth";
import meRoutes from "./routes/me";

type HealthCheck = {
	name: string;
	ok: boolean;
	details?: string;
};

function defaultPortForProtocol(protocol: string): number | undefined {
	switch (protocol) {
		case "postgres:":
		case "postgresql:":
			return 5432;
		case "amqp:":
		case "amqps:":
			return 5672;
		default:
			return undefined;
	}
}

async function tcpCheck(
	name: string,
	urlString?: string,
): Promise<HealthCheck> {
	if (!urlString) {
		return { name, ok: false, details: "not configured" };
	}

	let url: URL;
	try {
		url = new URL(urlString);
	} catch (error) {
		return { name, ok: false, details: "invalid url" };
	}

	const port =
		url.port !== ""
			? Number.parseInt(url.port, 10)
			: defaultPortForProtocol(url.protocol);
	if (!port || Number.isNaN(port)) {
		return { name, ok: false, details: "missing port" };
	}

	return await new Promise<HealthCheck>((resolve) => {
		const socket = net.createConnection({ host: url.hostname, port });
		const timeout = setTimeout(() => {
			socket.destroy();
			resolve({ name, ok: false, details: "timeout" });
		}, 300);

		socket.on("connect", () => {
			clearTimeout(timeout);
			socket.end();
			resolve({ name, ok: true });
		});

		socket.on("error", (error) => {
			clearTimeout(timeout);
			resolve({ name, ok: false, details: error.message });
		});
	});
}

export function buildApp(): FastifyInstance {
	const config = getConfig();
	const app = Fastify({
		logger: {
			level: config.logLevel,
			base: { service: config.serviceName },
			redact: {
				paths: ["req.headers.authorization", "req.headers.cookie"],
				remove: true,
			},
		},
		genReqId: (req) => {
			const header = req.headers["x-request-id"];
			if (typeof header === "string" && header.trim() !== "") {
				return header;
			}
			return randomUUID();
		},
	});

	app.addHook("onRequest", (req, reply, done) => {
		reply.header("x-request-id", req.id);
		done();
	});

	app.register(cors, {
		origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
	});

	app.register(swagger, {
		openapi: {
			info: {
				title: "Users Service",
				version: "1.0.0",
			},
			servers: [{ url: `http://localhost:${config.port}` }],
			tags: [
				{ name: "auth", description: "Authentication" },
				{ name: "users", description: "User profile" },
			],
			components: {
				securitySchemes: {
					bearerAuth: {
						type: "http",
						scheme: "bearer",
						bearerFormat: "JWT",
					},
				},
			},
			security: [{ bearerAuth: [] }],
		},
	});

	app.get("/openapi.json", async () => app.swagger());

	app.register(swaggerUi, {
		routePrefix: "/docs",
		uiConfig: {
			docExpansion: "list",
			deepLinking: true,
		},
	});

	app.register(rateLimitPlugin);
	app.register(dbPlugin);
	app.register(jwtPlugin);

	app.register(authRoutes, { prefix: "/v1/auth" });
	app.register(meRoutes, { prefix: "/v1/users" });

	app.setNotFoundHandler((req, reply) => {
		reply.code(404).send({ code: "NOT_FOUND", message: "Route not found" });
	});

	app.setErrorHandler((error, req, reply) => {
		if ((error as { validation?: unknown }).validation) {
			reply
				.code(400)
				.send({ code: "VALIDATION_ERROR", message: "Invalid request" });
			return;
		}

		const statusCode =
			typeof error.statusCode === "number" ? error.statusCode : 500;
		const code =
			typeof (error as { code?: string }).code === "string"
				? (error as { code: string }).code
				: statusCode >= 500
					? "INTERNAL_ERROR"
					: "BAD_REQUEST";
		const message = statusCode >= 500 ? "Internal Server Error" : error.message;

		req.log.error({ err: error }, "request failed");
		reply.code(statusCode).send({ code, message });
	});

	app.get("/health/live", async () => ({ status: "ok" }));

	app.get("/health/ready", async (_, reply) => {
		const checks = await Promise.all([
			tcpCheck("users-db", config.databaseUrl),
			tcpCheck("rabbitmq", config.rabbitUrl),
		]);
		const ok = checks.every((check) => check.ok);
		if (!ok) {
			reply.code(503);
		}
		return { status: ok ? "ok" : "error", checks };
	});

	return app;
}
