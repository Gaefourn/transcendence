import socketIOClient from "socket.io-client";
import { MovePaddleDTO, MoveBallDTO, ReflectBallDTO, ChallengeFormDTO, InviteDTO } from "store/dtos";
import { store } from "./index"
import { InviteReceived, InviteSent, RemoveInvite, setIsMatching } from "./gameSlice";
import { Vector2 } from "game-engine";

type socket = ReturnType<typeof socketIOClient>

const HOST = process.env.REACT_APP_HOST!;
const NAMESPACE = "game";
const PATH = "/game";

const LOG_EXCLUDE = ["exception", "paddle", "ball", "scoreboard"];

export default class Pongsocket
{
	public readonly io:socket = socketIOClient(HOST+"/"+NAMESPACE, { path: PATH, withCredentials:true });
	private _userid:string|undefined = undefined;
	get userId() { return this._userid; }

	public Connect() {
		this.io.on("auth", (userid:string)=>this._userid = userid );
		this.io.on("challenge",      (inv:InviteDTO)=>store.dispatch(InviteReceived(inv)));
		this.io.on("challenge-sent", (inv:InviteDTO)=>store.dispatch(InviteSent(inv)));
		this.io.on("challenge-cancelled", (invId:string)=>store.dispatch(RemoveInvite(invId)));
		this.io.on("challenge-refused",   (invId:string)=>store.dispatch(RemoveInvite(invId)));
		this.io.on("matchmaking", (isMatching:boolean)=>store.dispatch(setIsMatching(isMatching)));

		this.io.on("exception", (err)=>console.log("[socket]@exception", err?.status, err?.message));

		this.io.onAny((event, data) => {
			// if (!LOG_EXCLUDE.includes(event))
			// 	console.log("[socket]@"+event, data?.toString())
		});
	}

	public Clear() {
		this.io.removeAllListeners();
		this.io.disconnect();
	}

	public Ping() {
		this.io.emit("ping");
	}

	public MatchmakingRequest() {
		this.io.emit("match");
	}
	public MatchmakingCancel () {
		this.io.emit("unmatch");
	}

	public SendInvite(inv:ChallengeFormDTO){
		this.io.emit("challenge", inv);
	}
	public AcceptInvite(inviteId:string){
		this.io.emit("challenge-accepted", inviteId);
	}
	public RefuseInvite(inviteId:string){
		this.io.emit("challenge-refused", inviteId);
	}
	public RevokeInvite(inviteId:string){
		this.io.emit("challenge-cancelled", inviteId);
	}

	public Join(gameid:string) {
		this.io.emit("join", gameid);
	}

	public Quit() {
		this.io.emit("quit");
	}


	/**
	 * To be used periodically at all times.
	 * @param positionY	The y coordinate of the paddle.
	 * @param velocityY	The y velocity of the paddle
	 */
	public UpdatePlayerPadddle(positionY:number, velocityY:number) {
		const dto:MovePaddleDTO = { positionY, velocityY };
		this.io.emit("paddle", dto);
	}

	/**
	 * To be called once upon reflecting the ball toward the opponent.
	 * The client will loose authority on the ball after the server accepts the event.
	 * @param positionY	The Y coordinate of the collision with the player's paddle.
	 * The x coordinate is implied to be the paddle's surface.
	 * @param velocity	The angle of the ball after being reflected.
	 * Only the angle of the vector is taken into account, the speed is recomputed server-side.
	 */
	public ReflectBall(positionY:number, velocity:Vector2) {
		const dto:ReflectBallDTO = { positionY, velocity }
		this.io.emit("reflect", dto);
	}

};

export class GameSocket {
	private static _instance: Pongsocket | undefined = undefined;

	static get instance() { return GameSocket._instance!; }

	private constructor() { }

	static Connect() : Pongsocket {
		if (!GameSocket._instance)
		{
			GameSocket._instance = new Pongsocket();
			GameSocket._instance.Connect();
		}
		return GameSocket.instance;
	}

	static Disconnect() : void {
		GameSocket._instance?.Clear();
		GameSocket._instance = undefined;
	}
}
