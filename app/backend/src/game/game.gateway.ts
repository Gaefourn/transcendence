import { WebSocketGateway, WebSocketServer, WsResponse, WsException, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ValidationPipe, UsePipes, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { OngoingGameService } from './ongoingGame.service';
import { OngoingGameInterface } from './ongoing.interface';
import { MoveBallDTO, MovePaddleDTO, ReflectBallDTO, ScoreboardDTO, ChallengeFormDTO, InviteDTO, TrophyToastDTO } from 'src/dtos';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import MatchmakerService from './matchmaker.service';
import GatewayAuthGuard, { Client, Data, SockUser } from 'src/auth/guards/gateway.guard';
import { User } from 'src/user/user.entity';
import { Game } from './game.entity';
import { Status } from 'src/enums/status.enum';

import {Console, IdContext} from 'src/Logger';

@WebSocketGateway({ namespace:"game", path:"/game", cors:{ origin:true, credentials:true }})
@UseGuards(GatewayAuthGuard)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private ongoingGameService:OngoingGameService,
		private jwt:JwtService,
		private userdb:UserService,
		private matchmaker:MatchmakerService,
	) {
		this.ongoingGameService.onGoal    = (g) => this.OnGoal(g);
		this.ongoingGameService.onGameEnd = (g) => this.OnEndgame(g);
		this.ongoingGameService.onServe   = (g) => this.OnServe(g);
		this.userdb.onTrophyUnlocked = (...arg) => this.OnTrophyUnlocked(...arg);
		this.matchmaker.onMatchStatusChanged = (sock, match)=>this.OnMatchmake(sock, match);
	}

	@WebSocketServer() server: Server;

	private invite_map = new Map<string, InviteDTO>();

	private AssertPlayer(client:Socket) : OngoingGameInterface {
		const game = this.ongoingGameService.findGameByClient(client.id);
		if (!game)
			throw new WsException("Not a player");
		else
			return game;
	}
	private AssertBallAuthority(userId:string, game:OngoingGameInterface) : void {
		if (game.ball.authority !== userId)
			throw new WsException("No Authority");
	}
	private GetScoreboardDTO(game:OngoingGameInterface):ScoreboardDTO{
		return {
			player1: { userId: game.user1.id, score: game.user1.score, },
			player2: { userId: game.user2.id, score: game.user2.score, },
		};
	}

	private OnGoal(game:OngoingGameInterface){
		this.server.to(game.id).emit("scoreboard", this.GetScoreboardDTO(game));
	}
	private OnServe(game:OngoingGameInterface){
		this.server.to(game.id).emit("ball", game.ball);
	}
	private OnEndgame(game:Game){
		this.server.to(game.id).emit("endgame", { winner: game.winner.id, loser: game.loser.id });
	}
	private OnMatchmake(socket:Socket, isMatching:boolean){
		socket.emit("matchmaking", isMatching);
	}
	private OnTrophyUnlocked(userId:User["id"], trophyId:string, trophyLvl:number){
		const dto:TrophyToastDTO = {
			id: trophyId,
			level: trophyLvl
		};
		this.server.to(userId).emit("trophy-unlocked", dto);
	}

	async handleConnection(client:Socket) {
		// Guards are not applied to handleConnection.
		const user = await GatewayAuthGuard.VerifyUser(client, this.jwt, this.userdb);

		if (user == null)
			client.disconnect();
		else {
			Console.log(`Player ${user.username} connected on client ${client.id}`);
			client.join(user.id);
			client.emit("auth", user.id);
		}
	}

	async handleDisconnect(client:Socket) {
		const user = await GatewayAuthGuard.VerifyUser(client, this.jwt, this.userdb);
		if (!user)
			return;
		Console.log(`Player ${user.username} disconnected from client ${client.id}`);
		this.QuitGame(client, null);
		client.leave(user.id);
	}

	/**
	 * Try finding a game for the player to partake in.
	 * This may, in order of priority:
	 * - find an ongoing game the player is already a part of
	 * - create a new game with another player in the matchmaking queue
	 * - add the player to the matchmaking queue
	*/
	@SubscribeMessage("match")
	FindGame(@Client() client:Socket, @SockUser() user:User) {
		Console.log(`Matching player ${user.username}...`);
		const game = this.ongoingGameService.findGameByPlayer(user.id);
		if (game != null)
			return { event:"match", data:game.id };

		const match = this.matchmaker.Matchmake(user.id, client);
		if (match !== null) {
			match.opponent.emit("match", match.gameId);
			return { event:"match", data:match.gameId };
		}
	}
	@SubscribeMessage("unmatch")
	Unmatch(@Client() client:Socket, @SockUser() user:User) {
		this.matchmaker.Dequeue(user.id, client);
	}

	@SubscribeMessage('join')
	async JoinGame(@Client() client:Socket, @Data() gameId:string, @SockUser() user:User) {
		const game = this.ongoingGameService.findGameById(gameId);
		if (game == null)
			throw new WsException("Game not found");

		const isPlayer = !!this.ongoingGameService.ConnectUser(user.id, client, gameId);
		if (isPlayer)
			Console.log(`Player ${user.username} joined game ${gameId}`);
		else if (!game.HasPlayer(user.id))
			Console.log(`Player ${user.username} is spectating game ${gameId}`);
		else
			throw new WsException("Already connected on another client.");
		client.join(gameId);

		if (isPlayer && game.ConnectedPlayers === 2){
			await this.userdb.setStatus(game.user1.id, Status.Playing);
			await this.userdb.setStatus(game.user2.id, Status.Playing);
			const ball = this.ongoingGameService.ServeBall(game);
			this.server.to(game.id).emit("ball", ball);
		}

		this.server.to(client.id).emit("scoreboard", this.GetScoreboardDTO(game))
		return { event:"game-status", data:game.ToDTO()};
	}

	@SubscribeMessage('quit')
	async QuitGame(@Client() client:Socket, @SockUser() user:User):Promise<void> {
		let gameId = this.ongoingGameService.DisconnectUser(client.id);
		if (user)
			await this.userdb.setStatus(user.id, Status.Online);
		if (gameId) {
			Console.log(`A player disconnected from game ${gameId}`);
		}
	}

	@SubscribeMessage('paddle')
	@UsePipes(new ValidationPipe({ transform: true }))
	movePaddle(@Client() client:Socket, @Data() data:MovePaddleDTO, @SockUser() user:User): void {
		const game = this.AssertPlayer(client);

		const paddle = this.ongoingGameService.movePaddle(game, user.id, data);
		this.server.to(game.id).emit("paddle", paddle);
	}

	@SubscribeMessage('reflect')
	@UsePipes(new ValidationPipe({ transform: true }))
	ReflectBall(@Client() client, @Data() data:ReflectBallDTO, @SockUser() user:User) {
		const game = this.AssertPlayer(client);
		this.AssertBallAuthority(user.id, game);

		const ball = this.ongoingGameService.ReflectBall(game, user.id, data);
		this.server.to(game.id).emit("ball", ball);
	}

	@SubscribeMessage('game')//send all info about game
	handleEvent(client, data: any): WsResponse<unknown> {
		Console.log(`game room received: ${data} from client: ${client.id}`);//TODO reomve after testing
		const event = 'game';
		return { event, data };//TODO return single game details
	}

	@SubscribeMessage('challenge')
	@UsePipes(new ValidationPipe({ transform: true }))
	async sendInvite(@Client() client:Socket, @Data() data: ChallengeFormDTO, @SockUser() user:User) {
		//check invite validity
		try {
			if (!data.recipientId || data.recipientId === user.id)
				throw new WsException('Invalid challenge');
			const recipient_user = await this.userdb.findUserById(data.recipientId as User['id']);
			if (!recipient_user)
				throw new WsException('User not found');
			if (recipient_user.status === Status.Offline)
				throw new WsException('User is offline');
			if (recipient_user.blocked.indexOf(user.id) !== -1)
				throw new WsException("You're blocked by this user");
		} catch (e) {
			Console.ctx_err(new IdContext(user.id), e.message);
			return new WsException(e.message);
		}
		//push invite on array
		const invite: InviteDTO = {
			id: uuidv4(),
			senderId: user.id,
			...data,
			customSettings: data.customSettings? data.customSettings : null//TODO check model with mate
		}
		this.invite_map.set(invite.id, invite);
		//relay invite to invited user
		this.server.to(invite.recipientId).emit('challenge', invite);
		console.log('invite sent from ' + invite.senderId + ' to ' + invite.recipientId);
		this.server.in(invite.senderId).emit('challenge-sent', invite);
	}

	@SubscribeMessage('challenge-cancelled')
	@UsePipes(new ValidationPipe({ transform: true }))
	cancelInvite(@Client() client:Socket, @Data() inviteId:string, @SockUser() user:User) {
		const invite = this.invite_map.get(inviteId);
		if (!invite) {
			client.emit("challenge-cancelled", inviteId);
			throw new WsException("Invitation not found");
		}
		this.server.to(invite.recipientId).emit('challenge-cancelled', inviteId);//send signal to receiver
		this.server.to(invite.senderId).emit('challenge-cancelled', inviteId);//send signal to sender
		this.invite_map.delete(inviteId);//remove invite from array
	}

	@SubscribeMessage('challenge-accepted')
	@UsePipes(new ValidationPipe({ transform: true }))
	acceptInvite(@Client() client:Socket, @Data() inviteId:string, @SockUser() user: User) {
		const invite = this.invite_map.get(inviteId);
		if (!invite) {
			client.emit("challenge-cancelled", inviteId);
			throw new WsException("Invitation not found");
		}
		for (let [k, v] of Array.from(this.invite_map)) {
			// Invalidate all invites for both users
			if (v.senderId === invite.senderId    || v.recipientId === invite.senderId
			||  v.senderId === invite.recipientId || v.recipientId === invite.recipientId) {
				this.server.to(v.senderId).emit("challenge-cancelled", v.id);
				this.server.to(v.recipientId).emit("challenge-cancelled", v.id);
				this.invite_map.delete(k);
			}
		};
		const game = this.ongoingGameService.createGame(invite.senderId as User['id'], invite.recipientId as User['id'], invite.customSettings);
		this.server.to(invite.senderId).emit('match', game.id);//send match signal to sender user
		this.server.to(invite.recipientId).emit('match', game.id);//send match signal to invited user
	}

	@SubscribeMessage('challenge-refused')
	@UsePipes(new ValidationPipe({ transform: true }))
	refuseInvite(@Client() client:Socket, @Data() inviteId:string, @SockUser() user:User) {
		const invite = this.invite_map.get(inviteId);
		if (!invite) {
			client.emit("challenge-cancelled", inviteId);
			throw new WsException("Invitation not found");
		}
		this.server.to(invite.senderId).emit('challenge-refused', invite.id);
		this.server.to(invite.recipientId).emit('challenge-refused', invite.id);
		this.invite_map.delete(inviteId);
	}

}
