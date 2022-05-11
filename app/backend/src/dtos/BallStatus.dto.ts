import { IsNumber, IsUUID, ValidateNested } from "class-validator";
import Vector2DTO from "./Vector2.dto";

export default class BallStatusDTO
{
	/**
	 * The userId of the player who has authority over the ball.
	 */
	@IsUUID()
	public authority:string|null;

	/**
	 * The amount of times the ball has been reflected since it last scored.
	 */
	@IsNumber()
	public exchange:number;

	@ValidateNested()
	public position:Vector2DTO;

	@ValidateNested()
	public velocity:Vector2DTO;
}
