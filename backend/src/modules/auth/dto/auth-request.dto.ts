import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  IsString,
  MinLength,
} from 'class-validator';

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

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class RequestEmailVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
