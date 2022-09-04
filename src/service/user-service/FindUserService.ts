import { IUserRepository } from "@repositories/user-repository/IUserRepository";

export class FindUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string) {
    const { id: _id, first_name, last_name, email } = await this.userRepository.findUniqueUser(id);

    return {
      id: _id,
      first_name,
      last_name,
      email,
    };
  }
}
