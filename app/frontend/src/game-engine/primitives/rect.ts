export default class Rect
{
	public x:number=0;
	public y:number=0;
	public width :number=0;
	public height:number=0;

	constructor(x:number=0, y:number=0, width:number=0, height:number=0) {
		this.x = x;
		this.y = y;
		this.width  = width;
		this.height = height;
	}

	public static Remap(obj:Rect, from:Rect, to:Rect) {
		const ScalarX = to.width /from.width ;
		const ScalarY = to.height/from.height;
		const OffsetX = -(ScalarX*from.x) + to.x;
		const OffsetY = -(ScalarY*from.y) + to.y;

		return new Rect(
			(obj.x * ScalarX) + OffsetX,
			(obj.y * ScalarY) + OffsetY,
			obj.width * ScalarX,
			obj.height * ScalarY,
		);
	}
};
