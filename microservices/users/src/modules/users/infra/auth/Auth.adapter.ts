/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IAuthService, AuthToken } from '../../domain/services/IAuthService';
import { User } from '../../domain/entities/User';

@Injectable()
export class AuthAdapter implements IAuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: User): AuthToken {
    const payload = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
