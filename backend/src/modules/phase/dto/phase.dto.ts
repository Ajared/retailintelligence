import { QueryValidator } from '~/helpers/query.helper';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class PhaseDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class PhaseQueryValidator extends QueryValidator {
  @IsOptional()
  @IsString()
  name?: string;
}
