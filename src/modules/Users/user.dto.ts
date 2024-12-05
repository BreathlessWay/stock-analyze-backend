import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  @IsString()
  operName: string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  @IsString()
  passwd: string;
}
