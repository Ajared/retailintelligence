import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerRequest,
} from '@nestjs/throttler';
import * as SYS_MSG from '~/helpers/system-messages';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CustomHttpException } from '~/helpers/custom.exception';

@Injectable()
export class LimiterGuard extends ThrottlerGuard {
  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    try {
      return await super.handleRequest(requestProps);
    } catch (error) {
      if (!(error instanceof ThrottlerException)) throw error;

      const context = requestProps.context;
      const handlerName = context.getHandler().name;
      const controllerName = context.getClass().name;
      const resourceName = `${controllerName}[${handlerName}]`;

      throw new CustomHttpException(
        error.message,
        HttpStatus.TOO_MANY_REQUESTS,
        SYS_MSG.RESOURCE_CURRENTLY_UNAVAILABLE(resourceName),
      );
    }
  }
}
