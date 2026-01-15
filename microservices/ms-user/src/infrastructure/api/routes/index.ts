import { FastifyInstance } from 'fastify';
import healthRoutes from './health.routes';

export default async function routes(app: FastifyInstance) {
    await app.register(healthRoutes);
}
