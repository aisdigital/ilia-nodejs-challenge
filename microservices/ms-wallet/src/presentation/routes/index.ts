import { FastifyInstance } from 'fastify';
import healthRoutes from './health.routes';
import transactionRoutes from './transaction.routes';

export default async function routes(app: FastifyInstance) {
  await app.register(healthRoutes);
  await app.register(transactionRoutes);
}
