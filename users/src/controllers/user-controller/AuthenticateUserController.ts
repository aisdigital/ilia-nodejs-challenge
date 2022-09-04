import { Request, Response } from "express";
import { AuthenticateUserService } from "@service/user-service/AuthenticateUserService";
import { UserRepository } from "@repositories/user-repository/UserRepository";

type RequestUserDTO = {
  email: string;
  password: string;
};

class AuthenticateUserController {
  async handle(request: Request, response: Response) {
    const { email, password } = request.body as RequestUserDTO;

    const userRepository = new UserRepository();
    const authenticateUserService = new AuthenticateUserService(userRepository);

    const token = await authenticateUserService.execute(email, password);
    try {
      return response.json({ token });
    } catch (err) {
      if (!token) {
        return response.status(498).json("Invalid Token");
      }
      return response.status(500).json("INTERNAL ERROR! " + err);
    }
  }
}

export { AuthenticateUserController };
