import { IsNumber } from "class-validator";

export default class MovePaddleDTO
{
	@IsNumber()
	public positionY:number;
	@IsNumber()
	public velocityY:number;
}
