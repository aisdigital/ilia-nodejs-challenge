import { FastifyInstance } from 'fastify';
import healthRoutes from './health.routes';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';

export default async function routes(app: FastifyInstance) {
  await app.register(healthRoutes);
  await app.register(userRoutes);
  await app.register(authRoutes);
}
