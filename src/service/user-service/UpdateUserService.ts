import { IUserRepository } from "@repositories/user-repository/IUserRepository";

export class UpdateUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, email: string, password: string, first_name: string, last_name: string) {
    const {
      id: _id,
      email: _email,
      password: _pwd,
      first_name: _firstN,
      last_name: _lastN,
    } = await this.userRepository.updateUser(id, email, password, first_name, last_name);

    return {
      id: _id,
      email: _email,
      password: _pwd,
      first_name: _firstN,
      last_name: _lastN,
    };
  }
}
