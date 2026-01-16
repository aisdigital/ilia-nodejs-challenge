import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';
import { LoginUser } from '../../application/use-cases/LoginUser';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

export default async function authRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository();
  const loginUserUseCase = new LoginUser(userRepository);

  const controller = new AuthController(app, loginUserUseCase);

  app.post('/auth', controller.login.bind(controller));
}
