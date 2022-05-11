import { IsNumber } from 'class-validator';

export default class Vector2DTO
{
	@IsNumber()
	x:number;
	@IsNumber()
	y:number;
}
