import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_PRIVATE_KEY,
    });

    if (process.env.NODE_ENV !== 'test' && !process.env.JWT_PRIVATE_KEY) {
      throw new Error('JWT_PRIVATE_KEY environment variable is required');
    }
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
