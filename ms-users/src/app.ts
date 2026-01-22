import Fastify, { FastifyInstance, FastifyServerOptions, FastifyRequest, FastifyReply } from 'fastify';
import { connectDatabase } from './config/database';
import { AppError, UnauthorizedError } from './shared/errors/app-error';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';
import { registerSwagger } from './shared/plugins/swagger.plugin';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify(opts);

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
