import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { QueryValidator } from '~/helpers/query.helper';
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

  @IsString()
  @IsOptional()
  resetPasswordToken?: string;

  @IsOptional()
  resetPasswordExpires?: Date;
}

export class UserQueryValidator extends QueryValidator {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider;
}

export class AssignLocationDto {
  @IsString()
  @IsNotEmpty()
  stateId: string;

  @IsString()
  @IsNotEmpty()
  localGovernmentId: string;

  @IsString()
  @IsOptional()
  phaseId?: string;

  @IsString()
  @IsOptional()
  districtId?: string;
}
