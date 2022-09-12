import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';
import { Logger } from 'winston';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const roles = this.reflector.get<string[]>('roles', context.getHandler());
      this.logger.info('canActivate roles %j', roles);
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization
        ? request.headers.authorization.split(' ')[1]
        : null;

      jwt.verify(token, this.configService.getJwtSecret(), (err, payload) => {
        if (err) {
          this.logger.error('Invalid Token: %j', err);
          reject(
            new HttpException(
              { mensagem: 'Invalid Token' },
              HttpStatus.UNAUTHORIZED,
            ),
          );
        }
        resolve(true);
      });
    });
  }
}
