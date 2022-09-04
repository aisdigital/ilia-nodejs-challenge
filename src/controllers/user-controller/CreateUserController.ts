import { UserRepository } from "@repositories/user-repository/UserRepository";
import { Request, Response } from "express";
import { CreateUserService } from "@service/user-service/CreateUserService";

type RequestUserDTO = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export class CreateUserController {
  async handle(request: Request, response: Response) {
    const { email, first_name, last_name, password } = request.body as RequestUserDTO;

    const userRepository = new UserRepository();
    const createUserService = new CreateUserService(userRepository);

    const createUserResponse = await createUserService.execute(email, password, first_name, last_name);

    return response.status(201).json(createUserResponse);
  }
}
