import settings from "game-engine/settings.json";
import Engine from "game-engine/engine";
import { BallStatusDTO } from "store/dtos";
import {
	Paddle,
	PlayerPaddle,
	OpponentPaddle,
	Rect,
	Vector2,
} from "game-engine";


const	deltaTime = 1/settings.fixedFramerate;
const	Y_MAX = settings.playfield.height/2;
const	X_MAX = settings.playfield.width/2;
const	RADIUS = settings.ball.radius;
const	TAN_MAX = Math.tan(settings.paddles.maxDeflectAngle * Math.PI/180);

export default class Ball
{
	public position = new Vector2(0,0);
	public velocity = new Vector2(0,0);
	public authorithy:boolean = false;

	public gravity:boolean = false;
	public acceleration:boolean = false;

	public Update(engine:Engine, paddles:Paddle[]) {
		let oldPos = this.position.Clone();
		let oldVel = this.velocity.Clone();

		if (this.gravity && this.velocity.x !== 0) {
			// Dumb gravity application
			this.velocity.y += settings.ball.gravity * deltaTime
			// Prevent the ball from falling at too steep an angle.
			const FallMax = TAN_MAX * Math.abs(this.velocity.x);
			if (this.velocity.y > FallMax)
				this.velocity.y = FallMax;
			// Prevent the ball from slowing down while ascending.
			if (oldVel.y < 0)
				this.velocity.SetLength(oldVel.GetLength());
		}

		// Move
		this.position.x += this.velocity.x * deltaTime;
		this.position.y += this.velocity.y * deltaTime;

		// Bounce on Corridor
		if (this.position.y > Y_MAX) {
			this.position.y = 2*Y_MAX - this.position.y;
			this.velocity.y *= -1;
		}
		else if (this.position.y < -Y_MAX){
			this.position.y = 2*-Y_MAX - this.position.y;
			this.velocity.y *= -1;
		}

		// Check collision with Paddle
		for (let player of paddles)
		if (Math.sign(this.velocity.x) === -Math.sign(player.deflectDirection)) // Backface culling
		{
			const collisionLerpRatio = (player.position.x - oldPos.x) / (this.position.x - oldPos.x);
			const collision = Vector2.Lerp(oldPos, this.position, collisionLerpRatio);

			if((0 <= collisionLerpRatio && collisionLerpRatio <= 1) //horizontal
			&& (player.bottom-RADIUS <= collision.y && collision.y <= player.top+RADIUS)) //vertical
			{
				if (this.authorithy && player instanceof PlayerPaddle) {
					this.position = collision;
					this.velocity = player.DeflectAngle(collision.y);
					engine.socket.ReflectBall(this.position.y, this.velocity);
				}
				else if (!this.authorithy && player instanceof OpponentPaddle){
					this.position = collision;
					this.velocity = new Vector2(0,0);
				}
			}
		}

		// Goal detection
		if (this.position.x < -X_MAX || X_MAX < this.position.x) {
			this.position = new Vector2(0,0);
			this.velocity = new Vector2(0,0);
			this.authorithy = false;
		}
	}

	public SetState(engine:Engine, status:BallStatusDTO) {
		this.authorithy = (status.authority === engine.socket.userId);
		this.position = new Vector2(status.position.x, status.position.y);
		this.velocity = new Vector2(status.velocity.x, status.velocity.y);
	}

	public GetRect():Rect {
		return new Rect(
			this.position.x - (settings.ball.radius),
			this.position.y - (settings.ball.radius),
			settings.ball.radius * 2,
			settings.ball.radius * 2,
		);
	}
};
