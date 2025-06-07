import { PaginationMeta } from '~/helpers/query.helper';

export class AbstractResponseDto<T> {
  message: string;
  data?: T;
  meta?: Record<string, unknown> | PaginationMeta;
  timestamp?: Date | string;
  error?:
    | string
    | string[]
    | Record<string, unknown>
    | Record<string, unknown>[];
}
