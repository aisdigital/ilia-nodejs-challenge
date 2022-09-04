import { UserRepository } from "@repositories/user-repository/UserRepository";
import { UpdateUserService } from "@service/user-service/UpdateUserService";
import { Request, Response } from "express";

type RequestUserDTO = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export class UpdateUserController {
  async handle(request: Request, response: Response) {
    const { id } = request.params;
    const { email, password, first_name, last_name } = request.body as RequestUserDTO;

    const userRepository = new UserRepository();
    const findUsersService = new UpdateUserService(userRepository);

    const updateUser = await findUsersService.execute(id, email, password, first_name, last_name);

    return response.status(200).json(updateUser);
  }
}
