import settings from "game-engine/settings.json";
import Engine from "game-engine/engine";
import { PaddleStatusDTO } from "store/dtos";
import {
	Rect,
	Vector2,
} from "game-engine";


const POS_MAX = (settings.playfield.height - settings.paddles.height) * 0.5;
const DEFLECT_MAX = settings.paddles.maxDeflectAngle * Math.PI/180; // Degrees to Radians

const DELTATIME = 1/settings.fixedFramerate;

export default abstract class Paddle 
{
	public playerId:string;
	public position:Vector2 = new Vector2(0,0);
	public velocityY:number = 0;
	public deflectDirection:1|-1 = 1;

	public get top()   :number { return this.position.y + 0.5*settings.paddles.height; }
	public get bottom():number { return this.position.y - 0.5*settings.paddles.height; }

	public abstract Update(engine:Engine) : void;


	public SetState(engine:Engine, state:PaddleStatusDTO) {
		this.playerId = state.paddleId;
		this.position.y = state.positionY;
		this.velocityY  = state.velocityY;
	}

	protected Move() {
		this.position.y += this.velocityY * DELTATIME;

		if (this.position.y > POS_MAX)
			this.position.y = POS_MAX;
		else if (this.position.y < -POS_MAX)
			this.position.y = -POS_MAX;
	}

	/**
	 * Computes the new velocity of a ball that collided with the paddle.
	 * Note that for pong, the collision angle DOES NOT affect the deflection angle, only the position on the paddle matters.
	 * @param collisionY	The absolute Y position of the collision point.
	 * @return The new velocity of the ball.
	 */
	public DeflectAngle(collisionY:number) : Vector2 {
		collisionY -= this.position.y;
		let deflectAngle = DEFLECT_MAX * 2 * collisionY / settings.paddles.height;

		if (deflectAngle > DEFLECT_MAX)
			deflectAngle = DEFLECT_MAX;
		else if (deflectAngle < -DEFLECT_MAX)
			deflectAngle = -DEFLECT_MAX

		return new Vector2(
			Math.cos(deflectAngle) * settings.ball.velocity * this.deflectDirection,
			Math.sin(deflectAngle) * settings.ball.velocity,
		);
	}

	public GetRect():Rect {
		return new Rect(
			this.position.x - (settings.paddles.width  * 0.5),
			this.position.y - (settings.paddles.height * 0.5),
			settings.paddles.width,
			settings.paddles.height
		);
	}

};
