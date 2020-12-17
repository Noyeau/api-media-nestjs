import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ApiNoyeau = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.apiNoyeau;
    },
  );
