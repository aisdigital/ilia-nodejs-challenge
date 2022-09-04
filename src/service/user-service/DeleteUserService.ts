import { IUserRepository } from "@repositories/user-repository/IUserRepository";

export class DeleteUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string) {
    return await this.userRepository.deleteUser(id);
  }
}
