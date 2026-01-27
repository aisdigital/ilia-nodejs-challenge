import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { AppError } from './shared/errors/app-error';
import { transactionRoutes } from './modules/transactions/transaction.routes';
import { registerSwagger } from './shared/plugins/swagger.plugin';
import { registerHealthCheck } from './shared/plugins/health-check.plugin';
import { registerRequestContext } from './shared/plugins/request-context.plugin';
import { logError } from './shared/utils/logger';
import { idempotencyPlugin } from './shared/middlewares/idempotency.middleware';
import { IdempotencyConflictError } from './modules/idempotency';
import { createRateLimiterPlugin, BackpressureError } from './shared/middlewares/rate-limiter';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify(opts);

  await registerRequestContext(app);

  await registerHealthCheck(app);

  await registerSwagger(app);

  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });

  // Rate limiting and backpressure protection
  await app.register(createRateLimiterPlugin({
    tier: 'STRICT', 
    perIp: true,
    perUser: true,
    skipPaths: ['/health', '/ready', '/live', '/documentation'],
    enableHeaders: true,
    backpressure: {
      maxConcurrent: 100,
      maxQueueSize: 50,
      queueTimeout: 30_000,
      enabled: true,
    },
  }));

  await app.register(idempotencyPlugin);

  await connectDatabase();

  await app.register(transactionRoutes);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof BackpressureError) {
      request.log.warn({
        type: 'backpressure_error',
        code: error.code,
        message: error.message,
      });
      return reply.status(503).send({
        code: error.code,
        message: error.message,
      });
    }

    if (error instanceof IdempotencyConflictError) {
      return reply.status(409).send({
        code: 'IDEMPOTENCY_CONFLICT',
        message: error.message,
      });
    }

    if (error instanceof AppError) {
      request.log.warn({
        type: 'application_error',
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      });
      
      return reply.status(error.statusCode).send({
        code: error.code,
        message: error.message,
      });
    }

    logError(error, 'unhandled_error');
    request.log.error({
      type: 'internal_error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  });

  return app;
}