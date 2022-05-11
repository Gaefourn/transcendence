import settings from "game-engine/settings.json";
import {
	Rect,
} from "game-engine";

const CAMERARATIO = settings.camera.height / settings.camera.width;
const CAMERARECT = new Rect(
	-settings.camera.width / 2,
	-settings.camera.height / 2,
	settings.camera.width,
	settings.camera.height,
);

const OUTLINE = 2;
const PLAYFIELD_TOP = new Rect(
	(-settings.playfield.width  * 0.5) - OUTLINE,
	(-settings.playfield.height * 0.5) - OUTLINE,
	settings.playfield.width + (2 * OUTLINE),
	OUTLINE,
);
const PLAYFIELD_BOTTOM = new Rect(
	PLAYFIELD_TOP.x,
	-PLAYFIELD_TOP.y - OUTLINE,
	PLAYFIELD_TOP.width,
	PLAYFIELD_TOP.height,
);
const PLAYFIELD_LEFT = new Rect(
	PLAYFIELD_TOP.x,
	PLAYFIELD_TOP.y,
	OUTLINE,
	settings.playfield.height + (2 * OUTLINE),
);
const PLAYFIELD_RIGHT = new Rect(
	-PLAYFIELD_LEFT.x - OUTLINE ,
	PLAYFIELD_LEFT.y,
	PLAYFIELD_LEFT.width,
	PLAYFIELD_LEFT.height,
);

const UNIT_RECT = new Rect(0,0, 1,1);

export default class Renderer
{
	private readonly	_renderContext: CanvasRenderingContext2D;
	private readonly	_canvas: HTMLCanvasElement;
	private _worldToScreenTransform:Rect;
	private _updatedWidth :number;
	private _updatedHeight:number;
	
	constructor(canvas:HTMLCanvasElement) 
	{
		this._canvas = canvas;
		let context  = canvas.getContext("2d");

		if (context != null)
			this._renderContext = context!;
		else
			throw new Error("Rendering Context is NULL");

		this.UpdateResolution();
	}

	private UpdateResolution():void {
		this._updatedHeight = this._canvas.offsetHeight;
		this._updatedWidth  = this._canvas.offsetWidth ;
		const SCREENRATIO = this._canvas.offsetHeight / this._canvas.offsetWidth;
		if (CAMERARATIO < SCREENRATIO){
			this._canvas.width  = this._canvas.offsetWidth;
			this._canvas.height = this._canvas.width * CAMERARATIO;
		}
		else if (SCREENRATIO < CAMERARATIO){
			this._canvas.height = this._canvas.offsetHeight;
			this._canvas.width  = this._canvas.height / CAMERARATIO;
		}
		else {
			this._canvas.width  = this._canvas.offsetWidth;
			this._canvas.height = this._canvas.offsetHeight;
		}

		const SCREEN_RECT = new Rect(0,0, this._canvas.width, this._canvas.height);
		this._worldToScreenTransform = Rect.Remap(UNIT_RECT, CAMERARECT, SCREEN_RECT);
	}

	public Clear():void {
		if (this._updatedHeight !== this._canvas.offsetHeight
		||  this._updatedWidth  !== this._canvas.offsetWidth)
			this.UpdateResolution();
		else // clear is automatic when updating resolution.
			this._renderContext.clearRect(0,0, this._canvas.width, this._canvas.height);
	}

	public RenderPlayfield():void {
		this.RenderRect(PLAYFIELD_BOTTOM);
		this.RenderRect(PLAYFIELD_LEFT);
		this.RenderRect(PLAYFIELD_RIGHT);
		this.RenderRect(PLAYFIELD_TOP);
	}

	public RenderRect(rect:Rect):void {
		rect = this.RectWorldToScreen(rect);
		this._renderContext.fillStyle = "#eee";
		this._renderContext.fillRect(rect.x, rect.y, rect.width, rect.height);
	}

	private RectWorldToScreen(obj:Rect):Rect {
		const f = this._worldToScreenTransform;
		return new Rect(
			(obj.x * f.width ) + f.x,
			(obj.y * f.height) + f.y,
			obj.width *  f.width,
			obj.height * f.height,
		);
	}

	private GetLetterboxedScreenRect():Rect {
		const canvasRatio = this._canvas.width / this._canvas.height;
		let r  = new Rect(0,0, this._canvas.width, this._canvas.height);

		if (canvasRatio < CAMERARATIO) {
			r.height *= canvasRatio/CAMERARATIO;
			r.y = -(r.height - this._canvas.height) / 2;
		}
		else if (canvasRatio > CAMERARATIO) {
			r.width *= CAMERARATIO/canvasRatio;
			r.x = -(r.width - this._canvas.width) / 2;
		}
		return r;
	}
};
