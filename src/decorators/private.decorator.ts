import { SetMetadata } from '@nestjs/common';

export const IS_PRIVATE_KEY = 'isPrivate';
export const PrivateFields = (...fields: string[]) =>
  SetMetadata(IS_PRIVATE_KEY, fields);
