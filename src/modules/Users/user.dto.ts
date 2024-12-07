import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @MinLength(3)
  @IsString()
  operName: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  passwd: string;
}
