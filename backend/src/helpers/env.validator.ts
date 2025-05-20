import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { Logger } from '@nestjs/common';
import { plainToInstance, Transform } from 'class-transformer';

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
  @Transform(({ value }) => parseInt(value as string, 10))
  PORT!: number;

  @IsEnum(Environment)
  @Transform(({ value }) => value as Environment)
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
  @Transform(({ value }) => parseInt(value as string, 10))
  DB_PORT!: number;

  @IsString()
  DB_NAME!: string;

  @IsString()
  DB_ENTITIES!: string;

  @IsString()
  DB_MIGRATIONS!: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  DB_SSL!: boolean;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_EXPIRES_IN!: string;

  @IsString()
  INVITE_JWT_EXPIRES_IN!: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  EMAIL_OTP_EXPIRES_IN!: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  QUEUE_TLS!: boolean;

  @IsString()
  QUEUE_HOST!: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  QUEUE_PORT!: number;

  @IsString()
  @IsOptional()
  QUEUE_USERNAME!: string;

  @IsString()
  @IsOptional()
  QUEUE_PASSWORD!: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
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
  AUTH_CLIENT_ID!: string;

  @IsString()
  SUPER_ADMIN_EMAIL!: string;

  @IsString()
  SUPER_ADMIN_PASSWORD!: string;
}

export function validateEnv(config: Record<string, unknown>): EnvVariables {
  const validatedConfig = plainToInstance(EnvVariables, config);

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
