import { IsNotEmpty, IsString } from 'class-validator';

export class StateDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
