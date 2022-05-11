import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsUUID, Length, IsAscii } from 'class-validator';
import { User } from '../user/user.entity';
import { Chat } from './chat.entity';

export class ChatDao {

  @IsUUID()
  readonly id: Chat["id"];

  @IsString()
  @IsNotEmpty()
  @IsAscii()
  @Length(1, 20)
  readonly name: string;
}
