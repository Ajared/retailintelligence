import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { QueryValidator } from '~/helpers/query.helper';

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

  @IsOptional()
  @IsLatitude()
  minLat?: `${number}`;

  @IsOptional()
  @IsLatitude()
  maxLat?: `${number}`;

  @IsOptional()
  @IsLongitude()
  minLng?: `${number}`;

  @IsOptional()
  @IsLongitude()
  maxLng?: `${number}`;
}
