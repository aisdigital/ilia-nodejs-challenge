import { IUserRepository } from "@repositories/user-repository/IUserRepository";

export class CreateUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string, password: string, first_name: string, last_name: string) {
    const saveUser = await this.userRepository.save(email, password, first_name, last_name);

    return {
      id: saveUser.id,
      first_name: saveUser.first_name,
      last_name: saveUser.last_name,
      email: saveUser.email,
    };
  }
}
