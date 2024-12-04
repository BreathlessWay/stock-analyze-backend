import { IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  operName: string;

  @IsNotEmpty()
  passwd: string;
}
