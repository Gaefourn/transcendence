import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { GameSocket } from 'store/gameSocket';
import styles from "style/PlayButton";
import { useAppDispatch, useAppSelector } from 'store';
import { setIsMatching } from 'store/gameSlice';
import { useGameSocket } from 'hooks/useSocket';

const MatchButton:React.FC = () => {
	const navigate = useNavigate();
	const isMatching = useAppSelector(slice => slice.game.isMatching);
	const [ isHover, setIsHover ] = useState(false);
	const socket = GameSocket.Connect();

	function Match()  { socket.MatchmakingRequest(); }
	function Unmatch(){ socket.MatchmakingCancel(); }
	function OnMatchFound(gameId:string){
		navigate(`/game/${gameId}`);
	}

	useGameSocket<void>("match", undefined, OnMatchFound);

	const _onClick = isMatching ? Unmatch : Match;
	const _text  = isMatching ? (isHover ? "Cancel" : "Matching...") : "Play";
	const _style = isMatching ? (isHover ? styles.danger : styles.active) : styles.passive;
	return (
		<Button
			style={_style}
			variant="contained"
			onMouseLeave={()=>{setIsHover(false);}}
			onMouseEnter={()=>{setIsHover(true );}}
			onClick={_onClick}
		>
			{_text}
		</Button>
	);
}

export default MatchButton;
