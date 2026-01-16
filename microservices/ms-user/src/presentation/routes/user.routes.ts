import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';
import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { GetUser } from '../../application/use-cases/GetUser';
import { ListUsers } from '../../application/use-cases/ListUsers';
import { UpdateUser } from '../../application/use-cases/UpdateUser';
import { DeleteUser } from '../../application/use-cases/DeleteUser';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

export default async function userRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository();
  const registerUserUseCase = new RegisterUser(userRepository);
  const getUserUseCase = new GetUser(userRepository);
  const listUsersUseCase = new ListUsers(userRepository);
  const updateUserUseCase = new UpdateUser(userRepository);
  const deleteUserUseCase = new DeleteUser(userRepository);

  const controller = new UserController(
    registerUserUseCase,
    getUserUseCase,
    listUsersUseCase,
    updateUserUseCase,
    deleteUserUseCase
  );

  app.post('/users', controller.create.bind(controller));

  app.get('/users', { preHandler: [app.authenticate] }, controller.list.bind(controller));

  app.get('/users/:id', { preHandler: [app.authenticate] }, controller.getById.bind(controller));

  app.patch('/users/:id', { preHandler: [app.authenticate] }, controller.update.bind(controller));

  app.delete('/users/:id', { preHandler: [app.authenticate] }, controller.delete.bind(controller));
}
