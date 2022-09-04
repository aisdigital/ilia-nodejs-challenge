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

    try {
      const createUserResponse = await createUserService.execute(email, password, first_name, last_name);
      return response.status(201).json(createUserResponse);
    } catch (err) {
      if (!request.body) {
        return response.status(400).json("Invalid data to create user.");
      }
      return response.status(500);
    }
  }
}
