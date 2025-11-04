import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { UserDto } from '../../application/dtos/user.dto';
import { AppConfig } from '../config/app.config';

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  accessToken: string;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(user: UserDto): AuthResponse {
    const payload = { sub: user.id, email: user.email };
    const appConfig = this.configService.get<AppConfig>('app');

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      accessToken: this.nestJwtService.sign(payload, {
        secret: appConfig.jwtSecret,
        expiresIn: '24h',
      }),
    };
  }
}
