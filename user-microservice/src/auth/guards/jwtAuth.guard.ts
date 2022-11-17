// NestJS
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../decorators/isPublic.decorator';

// import { UnauthorizedError } from '../errors/unauthorized.error';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const canActivate = super.canActivate(context);

    if (typeof canActivate === 'boolean') {
      return canActivate;
    }

    return super.canActivate(context);

    // const canActivatePromise = canActivate as Promise<boolean>;

    // return canActivatePromise.catch((error) => {
    //   if (error instanceof UnauthorizedError) {
    //     throw new UnauthorizedException(error.message);
    //   }

    //   throw new UnauthorizedException();
    // });
  }
}
