import { IsNumber, IsUUID } from "class-validator";

export default class PaddleStatusDTO
{
	@IsUUID()
	public paddleId:string;
	@IsNumber()
	public positionY:number;
	@IsNumber()
	public velocityY:number;
}
