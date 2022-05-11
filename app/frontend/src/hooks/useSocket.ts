import socketIOClient from "socket.io-client";
import { useEffect, useState } from "react";
import { GameSocket } from "store/gameSocket";

type Socket = ReturnType<typeof socketIOClient>

function useSocket<T>(socket:Socket, event:string, defaultValue:T, preproc?:(dto:any)=>T) : T {
	const [value, setValue] = useState<T>(defaultValue);
	const listener = (preproc) ? (dto:any)=>setValue(preproc(dto)) : setValue;

	useEffect(()=>{
		socket.on(event, listener);
		return ()=>{socket.off(event, listener)};
	});

	return value;
}

function useGameSocket<T>(event:string, defaultValue:T, preproc?:(dto:any)=>T){
	return useSocket(GameSocket.Connect().io, event, defaultValue, preproc);
}

export {
	useSocket,
	useGameSocket,
};
