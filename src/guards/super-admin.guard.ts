import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import * as SYS_MSG from '~/helpers/system-messages';
import { UserService } from '~/modules/user/user.service';
import { CustomHttpException } from '~/helpers/custom.exception';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const controller = context.getClass();
    const resourceName = `${controller.name}[${handler.name}]`;
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const user = await this.userService.getUserById(request?.user?.sub ?? '');

      if (!user?.isSuperAdmin) {
        throw new CustomHttpException(
          SYS_MSG.FORBIDDEN_ACTION,
          HttpStatus.FORBIDDEN,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      throw new CustomHttpException(
        SYS_MSG.FORBIDDEN_ACTION,
        HttpStatus.FORBIDDEN,
        SYS_MSG.RESOURCE_CURRENTLY_UNAVAILABLE(resourceName),
      );
    }
  }
}
