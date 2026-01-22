import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { AppError } from './shared/errors/app-error';
import { transactionRoutes } from './modules/transactions/transaction.routes';
import { registerSwagger } from './shared/plugins/swagger.plugin';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify(opts);

  await registerSwagger(app);

  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });

  await connectDatabase();

  await app.register(transactionRoutes);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        code: error.code,
        message: error.message,
      });
    }

    request.log.error(error);

    return reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  });

  return app;
}