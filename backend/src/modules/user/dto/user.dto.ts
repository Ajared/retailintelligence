import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { AuthProvider } from '~/modules/auth/constants/auth.constant';

export default class UserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider;

  @IsBoolean()
  @IsOptional()
  isSuperAdmin?: boolean;

  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @IsString()
  @IsOptional()
  resetPasswordToken?: string;

  @IsOptional()
  resetPasswordExpires?: Date;
}
