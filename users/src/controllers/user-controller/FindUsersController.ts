import { UserRepository } from "@repositories/user-repository/UserRepository";
import { Response, Request } from "express";
import { FindUsersService } from "@service/user-service/FindUsersService";

export class FindUsersController {
  async handle(request: Request, response: Response) {
    const userRepository = new UserRepository();
    const findUsersService = new FindUsersService(userRepository);

    const users = await findUsersService.execute();
    try {
      return response.status(200).json(users);
    } catch (err) {
      if (!users) {
        return response.status(400).json("Users don't exist on database.");
      }

      return response.status(500).json("INTERNAL ERROR!" + err);
    }
  }
}
