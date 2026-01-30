import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_PRIVATE_KEY;

    if (process.env.NODE_ENV !== 'test' && !secret) {
      throw new Error('JWT_PRIVATE_KEY environment variable is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; email?: string; username?: string }) {
    return { userId: payload.sub, email: payload.email, username: payload.username };
  }
}
