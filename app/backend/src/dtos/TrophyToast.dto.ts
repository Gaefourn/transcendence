import { IsNumber, IsString } from "class-validator";

export default class TrophyToastDTO {
	@IsString()
	id:string;

	@IsNumber()
	level:number;
};
