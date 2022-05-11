import { ValidateNested } from 'class-validator';
import Vector2DTO from './Vector2.dto';

export default class MoveBallDTO 
{
	@ValidateNested()
	readonly position:Vector2DTO;
	@ValidateNested()
	readonly velocity:Vector2DTO;
}
