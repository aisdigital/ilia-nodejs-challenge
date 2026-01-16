import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { GetUser } from '../../application/use-cases/GetUser';
import { ListUsers } from '../../application/use-cases/ListUsers';
import { UpdateUser } from '../../application/use-cases/UpdateUser';
import { DeleteUser } from '../../application/use-cases/DeleteUser';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

const userRepository = new UserRepository();
const registerUserUseCase = new RegisterUser(userRepository);
const getUserUseCase = new GetUser(userRepository);
const listUsersUseCase = new ListUsers(userRepository);
const updateUserUseCase = new UpdateUser(userRepository);
const deleteUserUseCase = new DeleteUser(userRepository);

export class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { first_name, last_name, email, password } = request.body as any;

      if (!first_name || !last_name || !email || !password) {
        return reply.code(400).send({
          error: 'Missing required fields.'
        });
      }

      const user = await registerUserUseCase.execute({
        firstName: first_name,
        lastName: last_name,
        email,
        password,
      });

      return reply.code(200).send(user.toJSON());
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await listUsersUseCase.execute();
      return reply.code(200).send(users.map((u) => u.toJSON()));
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const user = await getUserUseCase.execute({ id });
      return reply.code(200).send(user.toJSON());
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { first_name, last_name, email, password } = request.body as any;

      const user = await updateUserUseCase.execute({
        id,
        firstName: first_name,
        lastName: last_name,
        email,
        password,
      });

      return reply.code(200).send(user.toJSON());
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      await deleteUserUseCase.execute({ id });
      return reply.code(200).send({ message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
