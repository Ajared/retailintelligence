import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';
import { UserRole } from '~/modules/user/constants/user.constant';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
}
export class SendInviteEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
