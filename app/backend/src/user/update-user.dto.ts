import { IsString, IsNotEmpty, IsAscii } from 'class-validator';

export class UpdateUserDto {

  @IsString()
  @IsNotEmpty()
  @IsAscii()
  readonly username: string;

}
