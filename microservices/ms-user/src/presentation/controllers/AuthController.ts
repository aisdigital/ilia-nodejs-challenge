import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { LoginUser } from '../../application/use-cases/LoginUser';

export class AuthController {
  constructor(
    private readonly app: FastifyInstance,
    private readonly loginUserUseCase: LoginUser
  ) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { user: userInput } = request.body as { user: { email: string; password: string } };

      if (!userInput || !userInput.email || !userInput.password) {
        return reply.code(400).send({
          error: 'Missing required fields',
        });
      }

      const { user } = await this.loginUserUseCase.execute({
        email: userInput.email,
        password: userInput.password,
      });

      const access_token = this.app.jwt.sign({
        id: user.id,
        email: user.email,
      });

      return reply.code(200).send({
        user: user.toJSON(),
        access_token,
      });
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(401).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
