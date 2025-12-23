export type WalletConfig = {
  serviceName: string;
  host: string;
  port: number;
  jwtPrivateKey: string;
  internalJwtPrivateKey?: string;
  databaseUrl?: string;
  rabbitUrl?: string;
  logLevel: string;
};

export function getConfig(): WalletConfig {
  const port = Number.parseInt(process.env.WALLET_PORT ?? "3001", 10);

  return {
    serviceName: "wallet-service",
    host: process.env.HOST ?? "0.0.0.0",
    port: Number.isNaN(port) ? 3001 : port,
    jwtPrivateKey: process.env.JWT_PRIVATE_KEY ?? "ILIACHALLENGE",
    internalJwtPrivateKey: process.env.INTERNAL_JWT_PRIVATE_KEY,
    databaseUrl: process.env.WALLET_DATABASE_URL,
    rabbitUrl: process.env.RABBITMQ_URL,
    logLevel: process.env.LOG_LEVEL ?? "info",
  };
}
