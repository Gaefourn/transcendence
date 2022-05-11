const ARROW_UP   = "ArrowUp";
const ARROW_DOWN = "ArrowDown";

const key_listen = [ARROW_UP, ARROW_DOWN];

export default class Controller
{
	private keyPressed:{[key:string]:boolean} = {};

	private readonly _onKeyPressEvent   = this.OnKeyPress.bind(this);
	private readonly _onKeyReleaseEvent = this.OnKeyRelease.bind(this);
	private _bound:boolean = false;


	Bind():void {
		if (this._bound)
			console.error("This controller is already bound.");
		else {
			window.addEventListener("keydown", this._onKeyPressEvent);
			window.addEventListener("keyup",   this._onKeyReleaseEvent);
			this._bound = true;
		}
	}
	Unbind():void {
		window.removeEventListener("keydown", this._onKeyPressEvent);
		window.removeEventListener("keyup",   this._onKeyReleaseEvent);
		this._bound = false;
	}

	ArrowUp()  :boolean { return this.keyPressed[ARROW_UP];   }
	ArrowDown():boolean { return this.keyPressed[ARROW_DOWN]; }

	private OnKeyPress(event:KeyboardEvent):void {
		for (let k of key_listen)
		if (k === event.code) {
			// console.log("Pressed: "+event.code);
			this.keyPressed[k] = true;
		}
	}
	private OnKeyRelease (event:KeyboardEvent):void {
		for (let k of key_listen)
		if (k === event.code) {
			// console.log("Released: "+event.code);
			this.keyPressed[k] = false;
		}
	}

};
