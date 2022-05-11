import React, { CSSProperties } from "react";
import { ScoreboardDTO } from "store/dtos";
import { useGameSocket } from "hooks/useSocket";
import { useGetUserByIdQuery } from "store/api";

const styles:Record<string, CSSProperties> = {
	main: {
		color: "#eee",
		backgroundColor: "#222",
		margin: 0,
		padding: 5,
		justifyContent: "center",
		textAlign: "center",
		display: "flex",
		borderBottom: "solid #444 1px",
	},
	separator: {
		backgroundColor: "#aaa",
		width: "2px",
		marginLeft:  "50px",
		marginRight: "50px",
	},
	partition: {
		display: "flex",
		flexBasis: "50%",
		flexGrow: 0,
	},
};

const PlayerInfo:React.FC<{player?:ScoreboardDTO['player1']}> = ({player})=>{
	const { data: user } = useGetUserByIdQuery(player?.userId ?? "");

	return <div>
		<h3>{user?.username ?? "player"}</h3>
		<p>{player?.score ?? 0}</p>
	</div>
}

const ScoreBoard:React.FC = () => {
	const board = useGameSocket<ScoreboardDTO|null>("scoreboard", null);

	return <div style={styles.main}>
		<div style={{...styles.partition, justifyContent: "right"}}>
			<PlayerInfo player={board?.player1}/>
		</div>
		<div style={styles.separator}/>
		<div style={{...styles.partition, justifyContent: "left"}}>
			<PlayerInfo player={board?.player2}/>
		</div>
	</div>
}

export default ScoreBoard;
