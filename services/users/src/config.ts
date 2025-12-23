export type UsersConfig = {
	serviceName: string;
	host: string;
	port: number;
	jwtPrivateKey: string;
	internalJwtPrivateKey?: string;
	databaseUrl?: string;
	rabbitUrl?: string;
	logLevel: string;
};

export function getConfig(): UsersConfig {
	const port = Number.parseInt(process.env.USERS_PORT ?? "3002", 10);

	return {
		serviceName: "users-service",
		host: process.env.HOST ?? "0.0.0.0",
		port: Number.isNaN(port) ? 3002 : port,
		jwtPrivateKey: process.env.JWT_PRIVATE_KEY ?? "ILIACHALLENGE",
		internalJwtPrivateKey: process.env.INTERNAL_JWT_PRIVATE_KEY,
		databaseUrl: process.env.USERS_DATABASE_URL,
		rabbitUrl: process.env.RABBITMQ_URL,
		logLevel: process.env.LOG_LEVEL ?? "info",
	};
}
