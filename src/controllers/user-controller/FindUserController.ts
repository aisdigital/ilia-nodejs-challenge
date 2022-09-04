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

    if (!user) {
      return response.status(400).json("Usuário não existe na base de dados.");
    }

    return response.status(200).json(user);
  }
}
