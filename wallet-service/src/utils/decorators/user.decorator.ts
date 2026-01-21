import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (userId === undefined || userId === null) {
      throw new UnauthorizedException('User ID not found in request');
    }

    const parsedUserId = typeof userId === 'string' ? parseInt(userId, 10) : Number(userId);

    if (isNaN(parsedUserId)) {
      throw new UnauthorizedException('Invalid user ID format');
    }

    return parsedUserId;
  },
);
