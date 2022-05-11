import { IsNumber, IsUUID, ValidateNested } from "class-validator";
import PaddleStatusDTO from "./PaddleStatus.dto";

export default class PlayerStatusDTO 
{
	@IsUUID()
	public id:string;

	@IsNumber()
	public score:number;

	@ValidateNested()
	public paddle:PaddleStatusDTO;
}
