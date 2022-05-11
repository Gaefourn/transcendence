import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { BallStatusDTO, GameSettingsDTO, MoveBallDTO, MovePaddleDTO, PaddleStatusDTO, ReflectBallDTO } from 'src/dtos';
import { OngoingGameInterface, GameUser } from './ongoing.interface';
import { User } from 'src/user/user.entity';
import { GameService } from 'src/game/game.service';
import { UserService } from 'src/user/user.service';
import { Game } from 'src/game/game.entity';
import * as settings from "./settings.json";


type gameEventCallback = (game:OngoingGameInterface) => any;
type endgameCallback   = (game:Game) => any;

const GRAVITY_SERVE_ANGLE = -70 * Math.PI/180;
const SERVE_VELOCITY = settings.ball.velocity / 2;

const defaultGameSettings:GameSettingsDTO = {
	acceleration: false,
	gravity: false,
};

@Injectable()
export class OngoingGameService {
	constructor(
		private gameService: GameService,
		private users:UserService,
	) {}

	/**
	 * Event that is fired whenever the ball scores.
	 */
	public onGoal:gameEventCallback;
	/**
	 * Event that is fired whenever the ball is respawned.
	 */
	public onServe:gameEventCallback;
	/**
	 * Event that is fired whenever an ongoing game ends.
	 */
	public onGameEnd:endgameCallback;
	public onGameCreated:gameEventCallback;
	private readonly ongoingGames: Map<string, OngoingGameInterface> = new Map<string,OngoingGameInterface>();

  findAllGames(): OngoingGameInterface[] {
    return Array.from(this.ongoingGames.values());
  }

	findGameById(id: string): OngoingGameInterface|null {
		return this.ongoingGames.get(id) ?? null;
	}

	findGameByPlayer(userId:string) : OngoingGameInterface|null {
		for (let game of this.ongoingGames.values())
		for (let user of [game.user1, game.user2])
			if (userId === user.id)
				return game;

		return null
	}

	findGameByClient(clientId:string) : OngoingGameInterface|null {
		for (let game of this.ongoingGames.values())
		for (let user of [game.user1, game.user2])
			if (clientId === user.client?.id)
				return game;

		return null
	}

	/**
	 * Attempts to mark a player as being connected on the given client
	 * This may fail under the cirumstances:
	 * - The user is not a player in this game. (They may be a spectator instead.)
	 * - The user is already connected on another client.
	 * @return On success, the game the player has joined. Null otherwise.
	 */
	ConnectUser(userId:string, client:Socket, gameId:string) : OngoingGameInterface|null {
		let game = this.findGameById(gameId);
		if (game == null)
			return null;

		let user:GameUser = undefined;
		if (userId === game.user1.id)
			user = game.user1;
		else if (userId === game.user2.id)
			user = game.user2;
		else
			return null;

		if (user.client?.connected)
			return null;

		user.client = client;
		return game;
	}

	/**
	 * Mark a client as disconnected from the game they are part of.
	 * @return The Id of the game the user was disconnected from, or null if they
	 * weren't part of any game.
	 */
	DisconnectUser(clientId:string) : string|null {
		for (let game of this.ongoingGames.values())
		for (let user of [game.user1, game.user2]) {
			if (user.client?.id === clientId) {
				user.client = null;
				this.endGame(game.id, game.GetOpponent(user.id).id);
				return game.id;
			}
		}

		return null;
	}


	createGame(user1:User["id"], user2:User["id"], settings?:GameSettingsDTO): OngoingGameInterface {
		if (this.findGameByPlayer(user1) || this.findGameByPlayer(user2))
			throw new Error("One of the players is already engaged in a game.")

		let game: OngoingGameInterface = new OngoingGameInterface();
		game.id = uuidv4();

		game.user1.id = user1;
		game.user1.score = 0;
		game.user1.position = 0;
		game.user1.velocity = 0;

		game.user2.id = user2;
		game.user2.score = 0;
		game.user2.position = 0;
		game.user2.velocity = 0;

		game.ball.authority = null;
		game.ball.position = { x: 0, y: 0 };
		game.ball.velocity = { x: 0, y: 0 };

		game.settings = settings ?? defaultGameSettings;

		this.ongoingGames.set(game.id, game);
		this.onGameCreated?.call(null, game);
		return game;
	}

	/**
	 * @param gameId
	 * @param victorId  Forcibly marks a specifc player as the victor, for
	 * exemple, if the other player has forfeited. If left undefined, the victor
	 * will be decided based on the score.
	 */
	async endGame(gameId:string, victorId?:User['id']) : Promise<void> {
		const game = this.findGameById(gameId);
		if (!game){
			console.error("Cannot end game that doesn't exist:", gameId);
			return;
		}
		this.ongoingGames.delete(gameId);
		const new_game = await this.gameService.createGame({
			id: game.id,
			user1: game.user1.id,
			user1_score: game.user1.score,
			user2: game.user2.id,
			user2_score: game.user2.score,
			ended: new Date(),
			winner: { id : victorId ?? ((game.user1.score > game.user2.score) ? game.user1.id : game.user2.id)},
			loser: { id: victorId ? (victorId === game.user1.id ? game.user2.id : game.user1.id) :
				((game.user1.score > game.user2.score) ? game.user2.id : game.user1.id) },
			custom: (game.settings) ? (game.settings.acceleration || game.settings.gravity) : false,
		});
		this.onGameEnd?.call(null, new_game);
	}

	movePaddle(game:OngoingGameInterface, userId:string, action:MovePaddleDTO): PaddleStatusDTO {
		let user:GameUser;
		if (game.user1.id === userId)
			user = game.user1;
		else if (game.user2.id === userId)
			user = game.user2;
		else
			throw new Error(`User ${userId} is not a player in game ${game.id}`);

		user.position = action.positionY;
		user.velocity = action.velocityY;
		return {
			paddleId: userId,
			positionY: action.positionY,
			velocityY: action.velocityY,
		};
	}


	private UpdateTimeToScore(game:OngoingGameInterface) {
		if (game.ball.velocity.x == 0) {
			game.timeToScore = NaN;
			return;
		}

		const distance = (settings.playfield.width/2) - (game.ball.position.x * Math.sign(game.ball.velocity.x));
		const duration = 1000 * distance / Math.abs(game.ball.velocity.x);
		game.timeToScore = Date.now() + duration;
		setTimeout(
			this.OnTimeToScoreExpired.bind(this, game.id, game.timeToScore),
			duration + 1000,
		);
	}
	private OnTimeToScoreExpired(gameId:string, expectedTime:number) {
		const game = this.ongoingGames.get(gameId);
		if (game?.timeToScore === expectedTime) {
			const attacker = game.GetOpponent(game.ball.authority);
			attacker.score++;
			this.onGoal?.call(null, game);
			if (attacker.score >= 10)
				this.endGame(gameId);
			else
				this.ServeBall(game);
		}
	}

	ServeBall(game:OngoingGameInterface) : BallStatusDTO {
		let direction:1|-1;
		if (game.ball.authority === game.user1.id) {
			// game.ball.authority = game.user1.id;
			direction = -1;
		}
		else {
			game.ball.authority = game.user2.id;
			direction = 1;
		}

		game.ball.exchange = 0;
		game.ball.position = { x:0, y:0 };
		if (game.settings.gravity) {
			game.ball.velocity = {
				x: Math.cos(GRAVITY_SERVE_ANGLE) * SERVE_VELOCITY * direction,
				y: Math.sin(GRAVITY_SERVE_ANGLE) * SERVE_VELOCITY,
			};
		}
		else {
			game.ball.velocity = {
				x: SERVE_VELOCITY * direction,
				y: 0,
			};
		}

		this.onServe?.call(null, game);
		this.UpdateTimeToScore(game);
		return game.ball;
	}

	ReflectBall(game:OngoingGameInterface, userId:string, action:ReflectBallDTO) : BallStatusDTO {
		game.ball.position.y = action.positionY;
		game.ball.exchange++;
		this.users.setAchievementCounter(game.user1.id as User["id"], "ballExchange", game.ball.exchange);
		this.users.setAchievementCounter(game.user2.id as User["id"], "ballExchange", game.ball.exchange);

		let angle = Math.atan2(action.velocity.y, action.velocity.x);
		let speed = settings.ball.velocity;
		if (game.settings.acceleration)
			speed += game.ball.exchange * settings.ball.accelerationIncrement;
		game.ball.velocity = {
			x: Math.cos(angle) * speed,
			y: Math.sin(angle) * speed,
		};

		if (userId === game.user1.id) {
			game.ball.position.x = settings.paddles.distanceToCenter * -1;
			game.ball.authority = game.user2.id;
		}
		else if (userId === game.user2.id) {
			game.ball.position.x = settings.paddles.distanceToCenter * +1;
			game.ball.authority = game.user1.id;
		}
		else
			throw new Error(`${userId} is not a player in game ${game.id}`);

		this.UpdateTimeToScore(game);
		return game.ball;
	}

	MoveBall(game:OngoingGameInterface, action:MoveBallDTO): BallStatusDTO {
		game.ball.velocity = action.velocity;
		game.ball.position = action.position;
		return game.ball;
	}

}
