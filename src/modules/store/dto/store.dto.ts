import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { StoreType } from '../constants/store.constant';

export class StoreDto {
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsNotEmpty()
  localGovernmentId: string;

  @IsString()
  @IsNotEmpty()
  districtId: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(StoreType)
  @IsNotEmpty()
  storeType: StoreType;

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
}
