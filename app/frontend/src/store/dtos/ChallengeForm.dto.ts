import { IsOptional, IsUUID, ValidateNested } from "class-validator";
import GameSettingsDTO from "./GameSettings.dto"

export default class ChallengeFormDTO 
{
	@IsUUID()
	recipientId:string;

	@ValidateNested()
	@IsOptional()
	customSettings?:GameSettingsDTO;
}