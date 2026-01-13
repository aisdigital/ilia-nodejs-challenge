import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

import { connectDB } from './config/database';
import jwtPlugin from './plugins/jwt';

dotenv.config();

const app = fastify({ logger: true });

const start = async (): Promise<void> => {
  try {
    await app.register(cors);
    await app.register(jwtPlugin);

    app.get('/health', async (request, reply) => {
      return { status: 'ok', service: 'wallet-microservice', timestamp: new Date().toISOString() };
    });

    app.get('/api/wallet', { preHandler: [app.authenticate] }, async (request, reply) => {
      return { message: 'Wallet data', user: request.user };
    });

    await connectDB();

    const port = parseInt(process.env.PORT || '3001', 10);
    const host = '0.0.0.0';

    await app.listen({ port, host });
    console.log(`Server running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
