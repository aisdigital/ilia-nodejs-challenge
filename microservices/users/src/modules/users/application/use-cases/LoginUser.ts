import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IAuthService, AuthToken } from '../../domain/services/IAuthService';
import { IUserRepository } from '../../domain/repository/IUserRepository';

export type LoginUserInput = {
  email: string;
  password: string;
};

export type LoginUserOutput = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  token: AuthToken;
};

@Injectable()
export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await this.authService.comparePassword(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const token = this.authService.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token: token,
    };
  }
}
