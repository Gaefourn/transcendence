import {
	Paddle,
} from "game-engine";

export default class OpponentPaddle extends Paddle 
{
	public Update() {
		this.Move();
	}
};
