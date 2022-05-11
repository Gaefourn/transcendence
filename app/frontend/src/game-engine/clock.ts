
export default class Clock
{
	/**
	 * The timestamp at which the last update occured.
	 * Measured in milliseconds.
	 */
	private _lastUpdate:number = 0;
	/**
	 * The time in-between two ticks.
	 * Measured in milliseconds.
	 */
	private _deltatime_ms:number;

	private _name?:string = undefined;
	private _running:boolean = false;
	private _physicListeners:CallableFunction[] = [];
	private _redrawListeners:CallableFunction[] = [];

	constructor(fixedFramerate:number = 50, name?:string){
		this._deltatime_ms = Math.round(1000/fixedFramerate);
		this._name = name;
	}

	public Start():void{
		if (this._running !== false)
			console.error("Could not start the Clock because it was already running.");
		else {
			this._running = true;
			window.requestAnimationFrame(this.FirstUpdate.bind(this));
		}
	}
	public Stop():void {
		if (this._running)
			this._running = false;
	}


	public AddPhysicListener(f:CallableFunction):void {
		this._physicListeners.push(f);
	}
	public AddRedrawListener(f:CallableFunction):void{
		this._redrawListeners.push(f);
	}
	public ClearListeners():void {
		this._physicListeners.length = 0;
		this._redrawListeners.length = 0;
	}


	private FirstUpdate(timestamp:number):void {
		this._lastUpdate = timestamp;
		window.requestAnimationFrame(this.Update.bind(this));
	}
	private Update(timestamp:number):void {
		if (!this._running) { return; }

		let updated = false;
		while ((this._lastUpdate + this._deltatime_ms) < timestamp) {
			updated = true;
			this._lastUpdate += this._deltatime_ms;
			this.DispatchEvent(this._physicListeners);
		}
		if (updated)
			this.DispatchEvent(this._redrawListeners);

		window.requestAnimationFrame(this.Update.bind(this));
	}
	private DispatchEvent(listeners:CallableFunction[]):void {
		for (let f of listeners) {
			try {
				f();
			}
			catch (e){
				console.error("Uncaught exception in clock loop");
				console.error(e);
			}
		}
	}

};
