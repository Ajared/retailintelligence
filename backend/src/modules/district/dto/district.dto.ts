import { QueryValidator } from '~/helpers/query.helper';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class DistrictDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phaseId: string;
}

export class DistrictQueryValidator extends QueryValidator {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phaseId?: string;
}
