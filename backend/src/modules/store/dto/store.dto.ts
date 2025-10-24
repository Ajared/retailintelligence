import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsLatitude,
  IsLongitude,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { QueryValidator } from '~/helpers/query.helper';
import { StoreType } from '../types/store.interface';

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
  @IsIn([
    'SHOP',
    'REFUSE_SITE',
    'SCHOOL',
    'HOSPITAL',
    'BAR_RESTAURANT',
    'FUELING_STATION',
    'HOTEL',
    'RECREATION_PARK',
    'FINANCIAL_INSTITUTION',
    'RELIGIOUS',
    'OTHER',
  ])
  storeType: StoreType;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.storeType === 'SHOP' || o.storeType === 'OTHER')
  @IsNotEmpty()
  storeTypeDescription?: string;

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

  @IsString()
  @IsOptional()
  @IsIn([
    'SHOP',
    'REFUSE_SITE',
    'SCHOOL',
    'HOSPITAL',
    'BAR_RESTAURANT',
    'FUELING_STATION',
    'HOTEL',
    'RECREATION_PARK',
    'FINANCIAL_INSTITUTION',
    'RELIGIOUS',
    'OTHER',
  ])
  storeType?: StoreType;

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
