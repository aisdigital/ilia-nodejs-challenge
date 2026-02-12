import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

export const ActiveUserId = createParamDecorator<undefined>(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const userId: string | undefined = request.userId;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return userId;
  },
);
