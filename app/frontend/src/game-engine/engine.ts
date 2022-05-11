import DuoScene from "./scenes/duo";
import { GameStatusDTO } from "store/dtos"
import settings from "game-engine/settings.json"
import {
	Clock,
	Controller,
	Renderer,
	Scene,
	Pongsocket,
} from "game-engine";

export default class Engine 
{
	public readonly controller = new Controller();
	public readonly gameClock = new Clock(settings.fixedFramerate, "Game");
	public readonly netwClock = new Clock(settings.networkFramerate, "Network");
	public readonly socket:Pongsocket;

	private _renderer:Renderer;
	private _scene?:Scene;

	constructor(canvas:HTMLCanvasElement, socket:Pongsocket) {
		this._renderer = new Renderer(canvas);
		this.socket = socket;
	}

	public Start(gameid:string):void {
		this.gameClock.AddPhysicListener(this.GameUpdate.bind(this));
		this.gameClock.AddRedrawListener(this.Redraw.bind(this));
		this.netwClock.AddRedrawListener(this.NetworkUpdate.bind(this));
		this.controller.Bind();
		this.gameClock.Start();
		this.netwClock.Start();

		this.socket.Join(gameid);
		this.socket.io.once("game-status", this._ongameinit);
		this.socket.io.once("endgame", this._ongameend)
		this.socket.io.onAny(this._onsocketevent);
	}
	public Stop():void {
		this.socket.io.off("game-status", this._ongameinit);
		this.socket.io.off("endgame", this._ongameend)
		this.socket.io.offAny(this._onsocketevent);
		this.socket.Quit()
		this.gameClock.Stop();
		this.netwClock.Stop();
		this.controller.Unbind();
		this.gameClock.ClearListeners()
		this.netwClock.ClearListeners()
	}

	private _ongameinit = this.OnGameInit.bind(this);
	private OnGameInit(gameState:GameStatusDTO){
		this._scene = new DuoScene(this, gameState);
	}

	private _ongameend = this.OnGameEnd.bind(this);
	private OnGameEnd(){
		this.Stop();
	}

	private _onsocketevent = this.OnSocketEvent.bind(this);
	private OnSocketEvent(event:string, data:unknown){
		this._scene?.OnNetworkEvent(this, event, data);
	}

	private GameUpdate():void {
		this._scene?.Update(this);
	}

	private Redraw():void {
		this._renderer.Clear();
		this._renderer.RenderPlayfield();
		if (this._scene)
		for (let r of this._scene.GetRects())
			this._renderer.RenderRect(r);
	}

	private NetworkUpdate():void {
		this._scene?.NetworkUpdate(this);
	}

};
