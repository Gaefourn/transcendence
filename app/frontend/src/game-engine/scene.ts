import Engine from "game-engine";
import {
	Rect,
} from "game-engine";


export default interface Scene 
{
	Update(engine:Engine) : void;
	NetworkUpdate(engine:Engine) : void;
	OnNetworkEvent(engine:Engine, event:string, data:unknown) : void;
	GetRects() : Rect[];
};
