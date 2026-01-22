import Fastify, { FastifyInstance, FastifyServerOptions, FastifyRequest, FastifyReply } from 'fastify';
import { connectDatabase } from './config/database';
import { AppError, UnauthorizedError } from './shared/errors/app-error';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';
import { registerSwagger } from './shared/plugins/swagger.plugin';
import { registerHealthCheck } from './shared/plugins/health-check.plugin';
import { registerRequestContext } from './shared/plugins/request-context.plugin';
import { logError } from './shared/utils/logger';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify(opts);

  await registerRequestContext(app);

  await registerHealthCheck(app);

  await registerSwagger(app);

  await connectDatabase();

  await app.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  });

  app.decorate('authenticate', async function (request: FastifyRequest, _reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      throw new UnauthorizedError('Invalid or missing token');
    }
  });

  await app.register(authRoutes);
  await app.register(userRoutes);

  app.setErrorHandler((error, request, reply) => {
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
