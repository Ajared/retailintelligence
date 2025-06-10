export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface SuccessResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedSuccessResponse<T> extends SuccessResponse<T> {
  meta: PaginationMeta;
}

export interface ErrorResponse {
  error: string | string[];
  message: string;
  timestamp: string;
}

export type Response<T> = T extends unknown[]
  ? PaginatedSuccessResponse<T> | ErrorResponse
  : SuccessResponse<T> | ErrorResponse;
