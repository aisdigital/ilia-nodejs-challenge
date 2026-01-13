import { FastifyInstance } from "fastify";
import { UsersRepository } from "./users.repository.js";
import { UsersService } from "./users.service.js";
import { UsersController } from "./users.controller.js";

export async function usersRoutes(app: FastifyInstance) {
  const repository = new UsersRepository();
  const service = new UsersService(repository, app.jwt);
  const controller = new UsersController(service);

  app.post("/users", controller.createUser.bind(controller));
  app.post("/login", controller.login.bind(controller));
  app.get("/users/:id", controller.getUserById.bind(controller));
}
