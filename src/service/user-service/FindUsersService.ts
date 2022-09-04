import { IUserRepository } from "@repositories/user-repository/IUserRepository";

export class FindUsersService {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute() {
    const allUsers = await this.userRepository.findUsers();

    const userData = allUsers.map(({ email, first_name, last_name, id }) => {
      const res = {
        id,
        first_name,
        last_name,
        email,
      };
      return res;
    });

    return userData;
  }
}
