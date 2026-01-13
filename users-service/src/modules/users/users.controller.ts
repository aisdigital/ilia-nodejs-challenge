import { FastifyRequest, FastifyReply } from "fastify";
import { UsersService } from "./users.service.js";
import { CreateUserDTO } from "./dto/create-user.dto.js";
import { LoginDTO } from "./dto/login.dto.js";

export class UsersController {
  constructor(private readonly service: UsersService) {}

  async createUser(
    request: FastifyRequest<{ Body: CreateUserDTO }>,
    reply: FastifyReply
  ) {
    const user = await this.service.createUser(request.body);

    reply.code(201).send({
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
    });
  }

  async login(
    request: FastifyRequest<{ Body: LoginDTO }>,
    reply: FastifyReply
  ) {
    const token = await this.service.login(request.body);
    reply.send({ token });
  }

  async getUserById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = await this.service.getUserById(request.params.id);

    if (!user) {
      reply.code(404).send({ message: "User not found" });
      return;
    }

    reply.send({
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
    });
  }
}
