import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';

export default async function userRoutes(app: FastifyInstance) {
  const controller = new UserController();

  app.post('/users', controller.create.bind(controller));

  app.get('/users', { preHandler: [app.authenticate] }, controller.list.bind(controller));

  app.get('/users/:id', { preHandler: [app.authenticate] }, controller.getById.bind(controller));

  app.patch(
    '/users/:id',
    { preHandler: [app.authenticate] },
    controller.update.bind(controller)
  );

  app.delete(
    '/users/:id',
    { preHandler: [app.authenticate] },
    controller.delete.bind(controller)
  );
}
