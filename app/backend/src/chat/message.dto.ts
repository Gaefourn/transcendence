import { IsString, IsNotEmpty, IsUUID, IsAscii, Length } from 'class-validator';
import { Chat } from './chat.entity';

export class MessageDto {

  @IsNotEmpty()
  @IsUUID()
  readonly channel: Chat["id"];

  @IsNotEmpty()
  @IsString()
  @Length(1, 256)
  readonly message: string;

}

export type Message = {
  sender: string,
  createdAt: string,
  content: string
}
