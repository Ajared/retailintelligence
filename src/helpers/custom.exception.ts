import camelToSnake from './camel-to-snake-case';
import * as SYS_MSG from '~/helpers/system-messages';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    response: string | Record<string, unknown>,
    status: HttpStatus,
    errors?:
      | string
      | string[]
      | Record<string, unknown>
      | Record<string, unknown>[],
  ) {
    super({ message: response, errors }, status);
  }

  getResponse(): {
    message: string;
    error?: unknown;
    timestamp?: string;
  } {
    const response = super.getResponse();

    if (typeof response === 'object' && response !== null) {
      const res = response as Record<string, unknown>;
      return camelToSnake({
        message: (res.message || SYS_MSG.INTERNAL_SERVER_ERROR) as string,
        error: res.errors || res.message || SYS_MSG.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
      });
    }

    return camelToSnake({
      message: response,
      error: SYS_MSG.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
}
