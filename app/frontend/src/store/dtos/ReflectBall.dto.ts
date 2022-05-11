import { IsNumber, ValidateNested } from "class-validator";
import Vector2DTO from "./Vector2.dto";

export default class ReflectBallDTO 
{
	@IsNumber()
	readonly positionY: number;

	@ValidateNested()
	readonly velocity:Vector2DTO;

}
