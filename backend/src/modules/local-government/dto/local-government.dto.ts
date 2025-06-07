import { QueryValidator } from '~/helpers/query.helper';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class LocalGovernmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  stateId: string;
}

export class LocalGovernmentQueryValidator extends QueryValidator {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  stateId?: string;
}
