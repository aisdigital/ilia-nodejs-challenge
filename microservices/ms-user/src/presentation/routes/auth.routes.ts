import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';

export default async function authRoutes(app: FastifyInstance) {
  const controller = new AuthController(app);

  app.post('/auth', controller.login.bind(controller));
}
