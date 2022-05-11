import { IsString, IsNotEmpty, IsUUID, IsAscii, Length } from 'class-validator';
import { User } from '../user/user.entity';

export class DmDto {

  @IsNotEmpty()
  @IsUUID()
  readonly user: User["id"];

  @IsNotEmpty()
  @IsString()
  @IsAscii()
  @Length(1, 256)
  readonly message: string;

}
