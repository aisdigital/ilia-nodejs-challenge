import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { updateUserSchema } from './user.schema';
import { ValidationError } from '../../shared/errors/app-error';

export class UserController {
  private service: UserService;

  constructor() {
    const repository = new UserRepository();
    this.service = new UserService(repository);
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const users = await this.service.findAll();
      reply.status(200).send(users);
    } catch (error) {
      throw error;
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const user = await this.service.findById(id);
      reply.status(200).send(user);
    } catch (error) {
      throw error;
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      
      const validationResult = updateUserSchema.safeParse(request.body);
      
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.message);
      }

      const user = await this.service.update(id, validationResult.data);
      reply.status(200).send(user);
    } catch (error) {
      throw error;
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      await this.service.delete(id);
      reply.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
