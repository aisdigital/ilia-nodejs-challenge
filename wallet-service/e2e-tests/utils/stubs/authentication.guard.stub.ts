import { CanActivate, ExecutionContext } from '@nestjs/common';

export class JwtAuthGuardMock implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    req.user = {
      userId: 1,
      email: 'test@test.com',
    };

    return true;
  }
}
