import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedError } from './errors/unauthorized.error';
import { UserEntity } from '../user/entities/user.entity';
import { UserPayload } from './models/UserPayload';
import { UserToken } from './models/UserToken';
import { DatabaseService } from '../repository/database/database.service';
import { first } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseRepository: DatabaseService,
  ) {}

  async login(user: UserEntity): Promise<UserToken> {
    const { id: sub, email, first_name, last_name } = user;
    const payload: UserPayload = {
      sub,
      email,
      first_name,
      last_name,
    };

    return {
      Bearer: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.databaseRepository.user.findFirst({
      where: { email },
    });

    if (user) {
      const isPasswordValid = password === user.password;

      if (isPasswordValid) {
        return {
          ...user,
          password: undefined,
        };
      }
    }

    throw new UnauthorizedError(
      'Email address or password provided is incorrect.',
    );
  }
}
