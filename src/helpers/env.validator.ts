import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

const logger = new Logger('EnvValidation');

enum Environment {
  Test = 'test',
  Local = 'local',
  Staging = 'staging',
  Development = 'development',
  Production = 'production',
}

class EnvVariables {
  @IsNumber()
  PORT!: number;

  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsString()
  DB_TYPE!: string;

  @IsString()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_HOST!: string;

  @IsNumber()
  DB_PORT!: number;

  @IsString()
  DB_NAME!: string;

  @IsString()
  DB_ENTITIES!: string;

  @IsString()
  DB_MIGRATIONS!: string;

  @IsBoolean()
  DB_SSL!: boolean;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_EXPIRES_IN!: string;

  @IsString()
  EMAIL_JWT_EXPIRES_IN!: string;

  @IsNumber()
  EMAIL_OTP_EXPIRES_IN!: number;

  @IsNumber()
  SMTP_PORT!: number;

  @IsString()
  SMTP_HOST!: string;

  @IsString()
  SMTP_USER!: string;

  @IsString()
  SMTP_FROM!: string;

  @IsString()
  SMTP_PASS!: string;

  @IsString()
  SUPER_ADMIN_EMAIL!: string;

  @IsString()
  SUPER_ADMIN_PASSWORD!: string;
}

export function validateEnv(config: Record<string, unknown>): EnvVariables {
  const validatedConfig = plainToInstance(EnvVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    errors.forEach((error) => {
      Object.values(error.constraints ?? {}).forEach((message) => {
        logger.error(`ENV Validation Error: ${message}`);
      });
    });

    process.exit(1);
  }

  return validatedConfig;
}
