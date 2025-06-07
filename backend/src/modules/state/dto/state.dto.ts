import { QueryValidator } from '~/helpers/query.helper';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class StateDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class StateQueryValidator extends QueryValidator {
  @IsOptional()
  @IsString()
  name?: string;
}
