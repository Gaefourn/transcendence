export default class Vector2
{
	public x:number=0;
	public y:number=0;

	constructor(x:number=0, y:number=0) {
		this.x = x;
		this.y = y;
	}

	public static Lerp(from:Vector2, to:Vector2, ratio:number) : Vector2 {
		let ratioFrom = 1 - ratio;
		return new Vector2(
			(from.x * ratioFrom) + (to.x * ratio),
			(from.y * ratioFrom) + (to.y * ratio),
		);
	}

	public Clone(){
		return new Vector2(this.x, this.y);
	}

	public GetLength(){
		return Math.sqrt((this.x*this.x) + (this.y*this.y));
	}

	public SetLength(length:number) : void {
		let angle = Math.atan2(this.y, this.x);

		this.x = Math.cos(angle) * length;
		this.y = Math.sin(angle) * length;
	}
};
