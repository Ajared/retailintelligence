import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import * as SYS_MSG from '~/helpers/system-messages';
import { ROLES_KEY } from '~/decorators/role.decorator';
import { CustomHttpException } from '~/helpers/custom.exception';
import { UserRole } from '~/modules/user/constants/user.constant';
import { UserModelAction } from '~/modules/user/user.model-action';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userModelAction: UserModelAction,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const userId = context.switchToHttp().getRequest<Request>().user?.sub;

    if (!userId) {
      throw new CustomHttpException(
        SYS_MSG.MISSING_REQUIRED_PARAMETER('User ID'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userModelAction.get({ id: userId });

    if (!user) {
      throw new CustomHttpException(
        SYS_MSG.UNAUTHORIZED_ACTION,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!requiredRoles.includes(user.role)) {
      throw new CustomHttpException(
        SYS_MSG.FORBIDDEN_ACTION,
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
