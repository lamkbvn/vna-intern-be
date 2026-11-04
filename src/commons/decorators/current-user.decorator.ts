import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../modules/users/user.entity.js';

export interface CurrentUserPayload {
  userId: string;
  username: string;
  role: UserRole;
  businessId: string | null;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
