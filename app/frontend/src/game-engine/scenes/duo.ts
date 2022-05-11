import settings from "game-engine/settings.json";
import Engine from "game-engine/engine";
import { GameStatusDTO } from "store/dtos";
import { 
	Ball,
	OpponentPaddle,
	Paddle,
	PlayerPaddle,
	Scene,
} from "game-engine";


export default class DuoScene implements Scene
{
	private _player1:Paddle;
	private _player2:Paddle;
	private _ball = new Ball();

	constructor(engine:Engine, gameState:GameStatusDTO) {
		this._ball.SetState(engine, gameState.ball);
		this._ball.gravity = gameState.settings.gravity;
		this._ball.acceleration = gameState.settings.acceleration;

		this._player1 = (gameState.player1.id === engine.socket.userId) ? new PlayerPaddle() : new OpponentPaddle();
		this._player2 = (gameState.player2.id === engine.socket.userId) ? new PlayerPaddle() : new OpponentPaddle();
		this._player1.SetState(engine, gameState.player1.paddle);
		this._player2.SetState(engine, gameState.player2.paddle);
		this._player1.position.x = -settings.paddles.distanceToCenter;
		this._player2.position.x = +settings.paddles.distanceToCenter;
		this._player1.deflectDirection = +1;
		this._player2.deflectDirection = -1;
	}

	public Update(engine:Engine){
		this._player1.Update(engine);
		this._player2.Update(engine);
		this._ball.Update(engine, [this._player1, this._player2]);
	}

	public NetworkUpdate(engine:Engine){
		for (let pad of [this._player1, this._player2])
			if (pad instanceof PlayerPaddle)
				engine.socket.UpdatePlayerPadddle(pad.position.y, pad.velocityY);
	}

	public OnNetworkEvent(engine:Engine, event:string, data:any){
		if (event === "paddle"){
			for (let pad of [this._player1, this._player2])
			if (pad.playerId === data.paddleId && pad instanceof OpponentPaddle)
				pad.SetState(engine, data);
		}
		else if (event === "ball"){
			this._ball.SetState(engine, data);
		}

	}

	public GetRects(){
		return [
			this._player1.GetRect(),
			this._player2.GetRect(),
			this._ball.GetRect(),
		];
	}
}
