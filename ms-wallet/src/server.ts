import { buildApp } from './app';
import { env } from './config/env';

async function start(): Promise<void> {
  try {
    const app = await buildApp({
      logger: {
        level: env.NODE_ENV === 'development' ? 'info' : 'error',
      },
    });

    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Microservice Wallet HTTP Server running on port ${env.PORT}`);
    console.log(`📚 Swagger documentation available at http://localhost:${env.PORT}/docs`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('⚠️ Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('⚠️ Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

start();