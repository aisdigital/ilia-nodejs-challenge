import { FastifyInstance } from 'fastify';
import { HealthController } from '../controllers/HealthController';

export default async function routes(app: FastifyInstance) {
  const controller = new HealthController();

  app.get('/health', controller.check.bind(controller));
}
