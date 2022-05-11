import { Get, Param, Query, Req, Controller, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { GameService } from './game.service';
import { OngoingGameService } from './ongoingGame.service';
import { UserService } from 'src/user/user.service';
import { Game } from './game.entity';
import { GameClass } from './game.class';
import { User } from 'src/user/user.entity';
import { Status } from 'src/enums/status.enum';
import {JwtGuard} from "../auth/guards";

@Controller('games')
export class GameController {
	constructor(
		private readonly gameService:GameService,
		private readonly ongoing:OngoingGameService,
		private readonly users:UserService,
	) {}

	@Get()
	@UseGuards(JwtGuard)
	async findAll(@Query('user') user: User["id"]) {
		let ret: Game[];
		if (user)
			ret = await this.gameService.findGameByUserId(user);
		else
			ret = await	this.gameService.findAllGames();
		return ret.map(elem => new GameClass(elem)).sort((game_1, game_2) => {
			if (game_1.ended > game_2.ended)
				return -1;
			else
				return 1;
		}).slice(0, 20);
	}

	@Get("surrender/:id")
	@UseGuards(JwtGuard)
	async Surrender(@Req() req, @Param('id') gameId:string) {
		const userId = req.user.id;
		const game = this.ongoing.findGameById(gameId);
		if (!game)
			return;
		if (userId!==game.user1.id && userId!==game.user2.id)
			throw new HttpException("You are not a player in this game.", HttpStatus.FORBIDDEN);
		const victor = game.GetOpponent(userId);
		await this.ongoing.endGame(game.id, victor.id);
		await this.users.setStatus(userId, Status.Online);
	}

	@Get(':id')
	async findOne(@Param('id') id: Game["id"]) {
		return new GameClass(await this.gameService.findGameById(id));
	}

	@Get("ongoingByUser/:userId")
	@UseGuards(JwtGuard)
	async GetCurrentGame(@Req() req, @Param('userId') userId:string) {
		const game = this.ongoing.findGameByPlayer(userId);
		return { gameId: game?.id ?? null };
	}

}
