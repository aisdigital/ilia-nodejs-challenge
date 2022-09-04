import { IUserRepository } from "@repositories/user-repository/IUserRepository";
import { genSalt, hash } from "bcryptjs";

type ExpectedReturn = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export class CreateUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ): Promise<ExpectedReturn> {
    const userAlreadyExists = await this.userRepository.findByEmail(email);

    if (userAlreadyExists) {
      throw new Error("User already exists.");
    }

    const salt = await genSalt(8);
    const passwordHash = await hash(password, salt);

    const saveUser = await this.userRepository.save(email, passwordHash, first_name, last_name);

    return {
      id: saveUser.id,
      first_name: saveUser.first_name,
      last_name: saveUser.last_name,
      email: saveUser.email,
    };
  }
}
