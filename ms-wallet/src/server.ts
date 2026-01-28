import { buildApp } from './app';
import { env } from './config/env';
import { startGrpcServer } from './grpc/wallet.server';
import { loggers } from './shared/utils/logger';

async function start(): Promise<void> {
  try {
    const app = await buildApp({
      logger: {
        level: env.NODE_ENV === 'development' ? 'info' : 'error',
      },
      disableRequestLogging: true, 
    });

    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    loggers.server.info({
      message: 'Microservice Wallet started successfully',
      port: env.PORT,
      environment: env.NODE_ENV,
      docs: `http://localhost:${env.PORT}/docs`,
    });

    // Start gRPC server
    startGrpcServer();
    loggers.grpc.info({
      message: 'gRPC Server started successfully',
      port: env.GRPC_PORT,
    });
  } catch (error) {
    loggers.server.fatal({ message: 'Failed to start server', error });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  loggers.server.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  loggers.server.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

start();