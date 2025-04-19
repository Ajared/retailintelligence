import { IsNotEmpty, IsString } from 'class-validator';

export class LocalGovernmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
