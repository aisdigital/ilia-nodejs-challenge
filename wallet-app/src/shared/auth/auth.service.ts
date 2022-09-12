import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  Inject,
  Request,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';

import { IAuthParams } from './interfaces/auth.interface';
import { ConfigService } from 'src/config/config.service';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(payload: IAuthParams): Promise<any> {
    const jwtPayload = this.configService.getMockAuthUser();
    this.logger.info(`AuthService jwtPayload %j`, jwtPayload);

    let expiresIn = this.configService.getJwtExpires();

    const accessToken = this.jwtService.sign(jwtPayload, {
      expiresIn,
    });
    return {
      accessToken,
    };
  }

  async getPayLoadByRequest(@Request() req): Promise<JwtPayload> {
    const token = req.headers.authorization
      ? req.headers.authorization.split(' ')[1]
      : null;

    try {
      return await (<JwtPayload>(
        jwt.verify(token, this.configService.getJwtSecret())
      ));
    } catch (err) {
      this.logger.error(`getPayLoadByRequest: `, err.message);
      throw new UnauthorizedException({
        mensagem: 'Invalid Token',
      });
    }
  }
}
