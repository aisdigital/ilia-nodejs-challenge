import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Authorization = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers.authorization;
  },
);
