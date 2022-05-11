import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { OngoingGameService } from "./ongoingGame.service";
import { OngoingGameInterface } from "./ongoing.interface";
import { User } from "src/user/user.entity";

var mmQueue:{ userId:User["id"], socket:Socket }|null = null;

type matchingStatusCallback = (socket:Socket, isMatching:boolean) => any;

@Injectable()
export default class MatchmakerService 
{
	public onMatchStatusChanged?:matchingStatusCallback;

	constructor(
		private readonly ongoingGames:OngoingGameService,
	){
		this.ongoingGames.onGameCreated = (g)=>this.OnGameCreated(g);
	}

	private OnGameCreated(game:OngoingGameInterface){
		if (game.HasPlayer(mmQueue?.userId)){
			this.onMatchStatusChanged?.call(null, mmQueue.socket, false);
			mmQueue = null;
		}
	}

	/**
	 * This may either, in order of priority: 
	 * - pair up the player with another player and create a game for them
	 * - add the player to the matchmaking queue
	*/
	public Matchmake(userId:User["id"], socket:Socket) : {gameId:string,opponent:Socket}|null {
		if (mmQueue == null || mmQueue.socket.connected==false){
			mmQueue = { userId, socket };
			this.onMatchStatusChanged?.call(null, socket, true);
		}
		else if (mmQueue.userId === userId) {
			console.warn(`Re-enqueueing ${userId} who was already in the matchmaking queue. (Possibly from a nother client)`);
			this.onMatchStatusChanged?.call(null, mmQueue.socket, false);
			this.onMatchStatusChanged?.call(null, socket,         true );
			mmQueue = { userId, socket };
		}
		else {
			console.log(`Match found between ${userId} and ${mmQueue.userId}`);
			let opponent = mmQueue;
			mmQueue = null;
			this.onMatchStatusChanged?.call(null, opponent.socket, false);
			this.onMatchStatusChanged?.call(null, socket,         false);
			const game = this.ongoingGames.createGame(userId, opponent.userId);
			const r = { gameId:game.id, opponent:opponent.socket };
			return r;
		}
		return null;
	}

	public Dequeue(userId:User["id"], socket:Socket){
		if (mmQueue?.socket?.id===socket.id && mmQueue?.userId===userId)
			mmQueue = null;
		this.onMatchStatusChanged?.call(null, socket, false);
	}
};
