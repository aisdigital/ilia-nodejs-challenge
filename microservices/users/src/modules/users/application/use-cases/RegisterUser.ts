import { Injectable, ConflictException } from '@nestjs/common';
import { User } from '../../domain/entities/User';
import { IAuthService, AuthToken } from '../../domain/services/IAuthService';
import { IUserRepository } from '../../domain/repository/IUserRepository';

export type RegisterUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type RegisterUserOutput = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  token: AuthToken;
};

@Injectable()
export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository, 
    private readonly authService: IAuthService,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('The email address provided is already in use.');
    }

    const passwordHash = await this.authService.hashPassword(input.password);

    const newUser = User.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash: passwordHash,
    });

    await this.userRepository.save(newUser);
    const token = this.authService.generateToken(newUser);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
      token: token,
    };
  }
}
