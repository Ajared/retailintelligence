import { QueryValidator } from '~/helpers/query.helper';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsNumberString,
} from 'class-validator';

export class StoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  localGovernmentId?: string;

  @IsString()
  @IsOptional()
  stateId?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  storeType: string;

  @IsString()
  @IsOptional()
  landmarks?: string;
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsOptional()
  enumeratorId: string;

  @IsString()
  @IsOptional()
  phaseId?: string;

  @IsString()
  @IsOptional()
  districtId?: string;
}

export class StoreQueryValidator extends QueryValidator {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  localGovernmentId?: string;

  @IsString()
  @IsOptional()
  stateId?: string;

  @IsString()
  @IsOptional()
  enumeratorId?: string;

  @IsString()
  @IsOptional()
  phaseId?: string;

  @IsString()
  @IsOptional()
  districtId?: string;

  @IsNumberString()
  @IsOptional()
  minLat?: string;

  @IsNumberString()
  @IsOptional()
  maxLat?: string;

  @IsNumberString()
  @IsOptional()
  minLng?: string;

  @IsNumberString()
  @IsOptional()
  maxLng?: string;
}
