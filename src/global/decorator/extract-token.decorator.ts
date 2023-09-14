import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const ExtractToken = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  return request.headers.authorization.split('Bearer ')[1];
});
