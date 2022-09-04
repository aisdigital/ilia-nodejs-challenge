import { UserRepository } from "@repositories/user-repository/UserRepository";
import { Request, Response } from "express";
import { DeleteUserService } from "@service/user-service/DeleteUserService";

type RequestIdProps = {
  id: string;
};

export class DeleteUserController {
  async handle(request: Request, response: Response) {
    const { id } = request.params as RequestIdProps;

    const userRepository = new UserRepository();
    const deleteUserService = new DeleteUserService(userRepository);

    const wasDeleted = await deleteUserService.execute(id);

    if (!wasDeleted) {
      response.status(400).json("Cannot be deleted.");
    }
    return response.status(204).json("Succesfully deleted.");
  }
}
