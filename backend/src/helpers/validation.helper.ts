import { HttpStatus } from '@nestjs/common';
import * as SYS_MSG from '~/helpers/system-messages';
import { CustomHttpException } from './custom.exception';

/**
 * UUID v4 validation regex
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4
 * @param value - The value to validate
 * @returns true if valid UUID v4, false otherwise
 */
export function isValidUUID(value: unknown): value is string {
  return typeof value === 'string' && UUID_V4_REGEX.test(value);
}

/**
 * Validates and throws error if the value is not a valid UUID v4
 * @param value - The value to validate
 * @param fieldName - The name of the field for error message
 * @throws CustomHttpException if validation fails
 */
export function validateUUID(value: unknown, fieldName: string): asserts value is string {
  if (!isValidUUID(value)) {
    throw new CustomHttpException(
      SYS_MSG.INVALID_PARAMETER(fieldName),
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Validates that a value is not null or undefined
 * @param value - The value to validate
 * @param fieldName - The name of the field for error message
 * @throws CustomHttpException if validation fails
 */
export function validateNotNull<T>(
  value: T | null | undefined,
  fieldName: string,
): asserts value is T {
  if (value === null || value === undefined) {
    throw new CustomHttpException(
      SYS_MSG.MISSING_REQUIRED_PARAMETER(fieldName),
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Validates multiple UUIDs at once
 * @param values - Object with field names as keys and values to validate
 * @throws CustomHttpException if any validation fails
 */
export function validateUUIDs(values: Record<string, unknown>): void {
  for (const [fieldName, value] of Object.entries(values)) {
    if (value !== undefined && value !== null) {
      validateUUID(value, fieldName);
    }
  }
}
