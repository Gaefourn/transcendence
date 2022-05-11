import { IsUUID, ValidateNested, IsOptional } from "class-validator";
import GameSettingsDTO from './GameSettings.dto';

export default class InviteDTO {

  @IsUUID()
  public id: string;
  
  @IsUUID()
  public senderId: string;
  
  @IsUUID()
  public recipientId: string;

  @IsOptional()
  @ValidateNested()
  public customSettings?: GameSettingsDTO;
}
