import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { useSurrenderMutation } from 'store/api';
import { GameStatusDTO } from 'store/dtos';
import { GameSocket } from 'store/gameSocket';
import styles from "style/PlayButton";
import { useGameSocket } from 'hooks/useSocket';

const SurrenderButton:React.FC<{gameId:string}> = (props) => {
	const navigate = useNavigate();
	const [ isHover, setIsHover ] = useState(false);
	const [surrenderMutation] = useSurrenderMutation();
	const gameId = props.gameId;

	function Surrender() {
		surrenderMutation(gameId!)
		.then(()=>navigate("/"));
	}

	const _style = isHover ? styles.danger : styles.passive;
	return (
		<Button
			style={_style}
			variant="contained"
			onMouseLeave={()=>{setIsHover(false);}}
			onMouseEnter={()=>{setIsHover(true );}}
			onClick={Surrender}
		>
			Surrender
		</Button>
	);
}

const LeaveButton:React.FC = () => {
	const navigate = useNavigate();
	return <Button style={styles.passive} variant="contained" onClick={()=>navigate("/")}>Leave</Button>
}

function CheckSpectate(game:GameStatusDTO):boolean {
	const sock = GameSocket.Connect();
	return (sock.userId !== game.player1.id && sock.userId !== game.player2.id);
}

const GameButton:React.FC<{gameId:string}> = (props) => {
	const isEndgame   = useGameSocket("endgame",     false, ()=>true     );
	const isSpectator = useGameSocket("game-status", false, CheckSpectate);

	if (isSpectator || isEndgame)
		return <LeaveButton/>
	else
		return <SurrenderButton gameId={props.gameId}/>
}

export default GameButton;
