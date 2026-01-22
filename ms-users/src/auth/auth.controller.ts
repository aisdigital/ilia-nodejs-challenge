import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/user.repository';
import { createUserSchema, loginSchema } from '../users/user.schema';
import { ValidationError } from '../shared/errors/app-error';

export class AuthController {
  private service: AuthService;

  constructor(private generateToken: (payload: { user_id: string }) => string) {
    const repository = new UserRepository();
    this.service = new AuthService(repository, generateToken);
  }

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validationResult = createUserSchema.safeParse(request.body);

      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.message);
      }

      const result = await this.service.register(validationResult.data);

      reply.status(201).send(result);
    } catch (error) {
      throw error;
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validationResult = loginSchema.safeParse(request.body);

      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.message);
      }

      const result = await this.service.login(validationResult.data);

      reply.status(200).send(result);
    } catch (error) {
      throw error;
    }
  }
}
