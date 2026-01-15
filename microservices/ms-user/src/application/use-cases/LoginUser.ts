import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import bcrypt from 'bcrypt';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  user: User;
}

export class LoginUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    return { user };
  }
}
