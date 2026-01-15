import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import bcrypt from 'bcrypt';

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class RegisterUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Error inserting user');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await this.userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: hashedPassword,
    });

    return user;
  }
}
