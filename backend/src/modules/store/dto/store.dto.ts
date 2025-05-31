import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class StoreDto {
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsNotEmpty()
  localGovernmentId: string;

  @IsString()
  @IsNotEmpty()
  stateId: string;

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
}
