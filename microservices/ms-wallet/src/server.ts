import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

import { connectDB } from './infrastructure/database/sequelize';
import jwtPlugin from './infrastructure/rest/plugins/jwt';
import routes from './infrastructure/rest/routes';

dotenv.config();

const app = fastify({ logger: true });

const start = async (): Promise<void> => {
  try {
    await app.register(cors);
    await app.register(jwtPlugin);
    await app.register(routes);

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
