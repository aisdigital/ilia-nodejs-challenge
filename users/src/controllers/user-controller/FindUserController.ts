import { UserRepository } from "@repositories/user-repository/UserRepository";
import { Response, Request } from "express";
import { FindUserService } from "@service/user-service/FindUserService";

type RequestIdProps = {
  id: string;
};

export class FindUserController {
  async handle(request: Request, response: Response) {
    const { id } = request.params as RequestIdProps;
    const userRepository = new UserRepository();
    const findUserService = new FindUserService(userRepository);
    const user = await findUserService.execute(id);

    try {
      return response.status(200).json(user);
    } catch (err) {
      if (!id) {
        return response.status(400).json("User doesn't exists on database.");
      }
      return response.status(500).json("INTERNAL ERROR!" + err);
    }
  }
}
