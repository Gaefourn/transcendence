import { IsNumber, IsUUID, ValidateNested } from "class-validator";

export class BoardPlayer {
	@IsUUID()
	userId:string;
	@IsNumber()
	score:number;
};

export default class ScoreboardDTO {
	@ValidateNested()
	player1:BoardPlayer;
	@ValidateNested()
	player2:BoardPlayer;
};
