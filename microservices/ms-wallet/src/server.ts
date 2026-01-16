import fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';

import { connectDB } from './infrastructure/database/sequelize';
import jwtPlugin from './presentation/plugins/jwt';
import routes from './presentation/routes';

const app = fastify({ logger: true });

const start = async (): Promise<void> => {
  try {
    await app.register(cors);
    await app.register(jwtPlugin);
    await app.register(routes);

    await connectDB();

    const port = config.server.port;
    const host = config.server.host;

    await app.listen({ port, host });
    console.log(`Server running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
