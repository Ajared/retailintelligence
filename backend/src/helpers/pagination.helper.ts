import {
  IsOptional,
  IsNumberString,
  IsString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type PaginationOptions =
  | {
      page?: string;
      limit?: string;
    }
  | undefined;

export const computePaginationMeta = (
  total: number,
  limit: number,
  page: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrevious = page > 1;

  return {
    total,
    limit,
    page,
    totalPages,
    hasNext,
    hasPrevious,
  };
};

export class PaginationValidator {
  @IsOptional()
  @IsNumberString({}, { message: 'Page must be a number string' })
  page?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a number string' })
  limit?: string;
}

export enum ExportType {
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel',
}

export class ExportTypeValidator {
  @IsString()
  @IsNotEmpty()
  @IsEnum(ExportType)
  type: ExportType;
}
