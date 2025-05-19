import { IsNotEmpty, IsString } from 'class-validator';

export class DistrictDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
