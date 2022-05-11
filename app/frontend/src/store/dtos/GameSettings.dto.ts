import { IsBoolean } from "class-validator";

export default class GameSettingsDTO 
{
	@IsBoolean()
	acceleration:boolean;
	@IsBoolean()
	gravity:boolean;
};
