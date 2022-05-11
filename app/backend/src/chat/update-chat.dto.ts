import { IsString, IsNotEmpty, IsBoolean, IsOptional, Length, IsAscii } from 'class-validator';

export class UpdateChatDto {

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsAscii()
  name: string;

  @IsOptional()
  @IsBoolean()
  readonly isPrivate: boolean;
  
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsAscii()
  @Length(1, 20)//TODO define values with mates
  readonly password: string;

}
