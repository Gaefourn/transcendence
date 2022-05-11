import { IsUUID, ValidateNested } from "class-validator";
import BallStatusDTO from "./BallStatus.dto";
import GameSettingsDTO from "./GameSettings.dto";
import PlayerStatusDTO from "./PlayerStatus.dto";

export default class GameStatusDTO
{
	@IsUUID()
	public gameId:string;

	@ValidateNested()
	public player1:PlayerStatusDTO;
	@ValidateNested()
	public player2:PlayerStatusDTO;

	@ValidateNested()
	public settings:GameSettingsDTO;
	
	@ValidateNested()
	public ball:BallStatusDTO;
};
