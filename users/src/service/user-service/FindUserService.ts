import { IUserRepository } from "@repositories/user-repository/IUserRepository";

type ExpectedReturn = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export class FindUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<ExpectedReturn> {
    const { id: _id, first_name, last_name, email } = await this.userRepository.findUniqueUser(id);

    return {
      id: _id,
      first_name,
      last_name,
      email,
    };
  }
}
