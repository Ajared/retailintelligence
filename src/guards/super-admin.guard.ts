import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import * as SYS_MSG from '~/helpers/system-messages';
import { UserModelAction } from '~/modules/user/user.model-action';
import { CustomHttpException } from '~/helpers/custom.exception';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private userModelAction: UserModelAction) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const controller = context.getClass();
    const resourceName = `${controller.name}[${handler.name}]`;
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const user = await this.userModelAction.get({
        id: request?.user?.sub ?? '',
      });

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
