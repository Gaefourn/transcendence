import { IsString, IsNotEmpty, IsDate, IsInt, IsOptional} from 'class-validator';

export class AchievementUnlockDTO {

	@IsString()
	@IsNotEmpty()
	id: string;

	@IsOptional()
	@IsDate()
	date?:string;

	@IsInt()
	level: number;

	@IsInt()
	progress: number;

	@IsInt()
	progress_max: number;

}
