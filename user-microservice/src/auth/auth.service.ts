import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { UserPayload } from './models/UserPayload';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from './models/UserToken';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  authenticate(user: User): UserToken {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      fristName: user.fristName,
      lastName: user.lastName,
    };

    const jwtToken = this.jwtService.sign(payload);

    return {
      id: user.id,
      fristName: user.fristName,
      lastName: user.lastName,
      email: user.email,
      accessToken: jwtToken,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (user) {
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (isValidPassword) {
        return {
          ...user,
          password: undefined,
        };
      }
    }
    throw new Error('email/password incorect');
  }
}
