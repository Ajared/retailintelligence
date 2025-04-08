import { HttpStatus, Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import * as SYS_MSG from '~/helpers/system-messages';
import { CustomHttpException } from './custom.exception';
import { validate, ValidationError } from 'class-validator';
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object: object =
      value === undefined || value === null
        ? new (metatype as new () => object)()
        : plainToInstance(metatype, value);

    const validationErrors: ValidationError[] = await validate(object);
    if (validationErrors.length > 0) {
      const invalidFields = validationErrors.map(
        (error: ValidationError) => error.property,
      );
      const errors = validationErrors.map((error: ValidationError) => ({
        field: error.property,
        errors: error.constraints
          ? Object.values(error.constraints)
          : ['Unknown validation error'],
      }));

      const missingRequiredFields = errors
        .filter((error) =>
          error.errors.some((e) => e.includes('should not be empty')),
        )
        .map((error) => error.field);
      const errorMessage =
        missingRequiredFields.length > 0
          ? missingRequiredFields.length === 1
            ? SYS_MSG.MISSING_REQUIRED_PARAMETER(missingRequiredFields[0])
            : SYS_MSG.MISSING_REQUIRED_PARAMETERS(missingRequiredFields)
          : invalidFields.length === 1
            ? SYS_MSG.INVALID_PARAMETER(invalidFields[0])
            : SYS_MSG.INVALID_PARAMETERS(invalidFields);

      throw new CustomHttpException(
        errorMessage,
        HttpStatus.UNPROCESSABLE_ENTITY,
        errors,
      );
    }

    return object;
  }

  private toValidate(metatype: Type): boolean {
    const types: Type[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
