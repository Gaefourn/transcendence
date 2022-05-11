import { Socket } from "socket.io";
import { BallStatusDTO, GameSettingsDTO, GameStatusDTO, PlayerStatusDTO,} from "src/dtos"
import { User } from "src/user/user.entity";

export class GameUser {
	public id:User["id"];
	public client?:Socket = null;
	public score:number = 0;
	public position:number = 0;
	public velocity:number = 0;

	public ToDTO():PlayerStatusDTO {
		return {
			id: this.id,
			score: this.score,
			paddle: {
				paddleId: this.id,
				positionY: this.position,
				velocityY: this.velocity,
			}
		};
	}
}

export class OngoingGameInterface {

	public id:string;

	public user1:GameUser = new GameUser();
	public user2:GameUser = new GameUser();

	public settings:GameSettingsDTO;

	/**
	 * The date in milliseconds at which the ball should reach the goal if the 
	 * player doesn't reflect it.
	 */
	public timeToScore:number = NaN;
	public ball:BallStatusDTO = new BallStatusDTO();

	public get ConnectedPlayers():number {
		return (this.user1.client?.connected ? 1 : 0)
		     + (this.user2.client?.connected ? 1 : 0)
		     ;
	}

	public HasPlayer(userId:string) {
		return this.user1.id === userId || this.user2.id === userId;
	}

	public GetPlayer(userId:string) {
		if (this.user1.id === userId)
			return this.user1;
		if (this.user2.id === userId)
			return this.user2
		throw new Error(`${userId} is not a player in game ${this.id}`);
	}

	public GetOpponent(userId:string){
		if (this.user1.id === userId)
			return this.user2;
		if (this.user2.id === userId)
			return this.user1
		throw new Error(`${userId} is not a player in game ${this.id}`);
	}

	public ToDTO():GameStatusDTO {
		return {
			gameId: this.id,
			player1: this.user1.ToDTO(),
			player2: this.user2.ToDTO(),
			settings: this.settings,
			ball: this.ball,
		};
	}

}
