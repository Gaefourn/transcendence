import React, {CSSProperties, useEffect} from 'react';
import { useParams } from "react-router-dom";
import { GameSocket } from "store/gameSocket";
import Engine from "../game-engine";
import ScoreBoard from "components/game/ScoreBoard";
import EndgameScreen from "components/game/EndgameScreen";
import { useGameSocket } from 'hooks/useSocket';
import {useAppDispatch} from 'store';
import {api} from 'store/api';

const styles: Record<string, CSSProperties> = {
	main: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
	},
	screen:{
		width: "100%",
		height: "100%",
		position: "relative",
		overflow: "hidden",
	},
	screenFill: {
		position: "absolute",
		width: "100%",
		height: "100%",
	},
	canvas: {
		background:"#111",
		objectFit: "contain",
	},
};

export class Game extends React.Component<{id:string}>
{
	private	_engine:Engine|null = null;

	componentDidMount() {
		const id = this.props.id;

		let canvas = document.getElementById("game-canvas");
		if (!(canvas instanceof HTMLCanvasElement))
			throw new Error("Game canvas could not be found");

		this._engine = new Engine(canvas, GameSocket.Connect());
		this._engine.Start(id);
	}

	componentWillUnmount(){
		this._engine?.Stop();
	}

	render() {
		return <canvas id="game-canvas" style={{...styles.screenFill, ...styles.canvas}} />
	}
};

const VictorDisplay:React.FC = ()=>{
	const { winner, loser } = useGameSocket("endgame", { } as { winner?: string, loser?: string });
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (winner)
			dispatch(api.util.invalidateTags(['Game', { type: 'User', id: winner }]));
		if (loser)
			dispatch(api.util.invalidateTags([{ type: 'User', id: loser }]));
	}, [winner, loser, dispatch]);

	return <>
		{winner && <EndgameScreen userId={winner} style={styles.screenFill} />}
	</>
}

export const GameView:React.FC= () => {
	const {id} = useParams();

	return (
		<>
			<ScoreBoard />
			<div style={styles.screen}>
				<Game id={id!} />
				<VictorDisplay/>
			</div>
		</>);
}
