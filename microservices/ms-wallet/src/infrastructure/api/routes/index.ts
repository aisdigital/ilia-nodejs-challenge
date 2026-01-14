import { FastifyInstance } from 'fastify';
import healthRoutes from './health.routes';
import walletRoutes from './wallet.routes';

export default async function routes(app: FastifyInstance) {
  await app.register(healthRoutes);
  await app.register(walletRoutes);
}
