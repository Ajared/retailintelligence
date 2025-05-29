export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type SuccessResponse<T> = {
  message: string;
  data: T;
  meta?: Record<string, unknown> | PaginationMeta;
  timestamp: Date | string;
};

export type ErrorResponse = {
  message: string;
  error:
    | string
    | string[]
    | Record<string, unknown>
    | Record<string, unknown>[];
  timestamp: Date | string;
};

export type Response<T> = SuccessResponse<T> | ErrorResponse;
