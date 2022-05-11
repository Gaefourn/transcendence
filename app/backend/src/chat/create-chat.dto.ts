import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsUUID, Length, IsAscii } from 'class-validator';
import { User } from '../user/user.entity';

export class CreateChatDto {

  @IsString()
  @IsNotEmpty()
  @IsAscii()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  _owner: User;

  @IsOptional()
  @IsBoolean()
  readonly isPrivate: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)//TODO define values with mates
  readonly password: string;

}
