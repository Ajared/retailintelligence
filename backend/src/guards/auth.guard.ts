import {
  Injectable,
  HttpStatus,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { trySafe } from '~/helpers/try-safe';
import * as SYS_MSG from '~/helpers/system-messages';
import { UserService } from '~/modules/user/user.service';
import { TokenService } from '~/modules/token/token.service';
import { CustomHttpException } from '~/helpers/custom.exception';
import { IS_PUBLIC_KEY } from '~/decorators/skip-auth.decorator';
import { UserStatus } from '~/modules/user/constants/user.constant';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const controller = context.getClass();
    const resourceName = `${controller.name}[${handler.name}]`;
    const request = context.switchToHttp().getRequest<Request>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      controller,
    ]);

    if (isPublic) {
      return true;
    }

    const token = this.tokenService.extractTokenFromHeader(request);
    if (!token) {
      throw new CustomHttpException(
        SYS_MSG.TOKEN_INVALID('Authorization'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const [verifyError, verifyResult] = await trySafe(
      async () => await this.tokenService.verifyToken(token, request),
    );

    if (verifyError) {
      throw verifyError instanceof CustomHttpException
        ? verifyError
        : new CustomHttpException(
            SYS_MSG.FORBIDDEN_ACTION,
            HttpStatus.FORBIDDEN,
            SYS_MSG.RESOURCE_CURRENTLY_UNAVAILABLE(resourceName),
          );
    }

    const [userError, user] = await trySafe(() =>
      this.userService.getUserById(verifyResult.request.user?.sub as string),
    );

    if (userError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('User'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_CURRENTLY_UNAVAILABLE(resourceName),
        HttpStatus.FORBIDDEN,
      );
    }

    Object.assign(request, verifyResult.request);
    return true;
  }
}
