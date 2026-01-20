import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { connectDatabase } from './config/database';
import { AppError } from './shared/errors/app-error';
import { transactionRoutes } from './transactions/transaction.routes';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify(opts);

  // Connect to database
  await connectDatabase();

  // Register routes
  await app.register(transactionRoutes);

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        code: error.code,
        message: error.message,
      });
    }

    // Log unexpected errors
    request.log.error(error);

    return reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  });

  return app;
}