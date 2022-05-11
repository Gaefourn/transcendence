import settings from "game-engine/settings.json";
import Engine from "game-engine/engine";
import {
	Paddle,
} from "game-engine";

export default class PlayerPaddle extends Paddle 
{
	public Update(engine:Engine):void {
		const control = engine.controller;
		const PrevVel = this.velocityY;
		this.velocityY = 0;
		if (control.ArrowUp())
			this.velocityY -= settings.paddles.speed;
		if (control.ArrowDown())
			this.velocityY += settings.paddles.speed;

		if (PrevVel !== this.velocityY)
			engine.socket.UpdatePlayerPadddle(this.position.y, this.velocityY);

		this.Move();
	}
}
