import Avatars from 'components/Avatars';
import React, {CSSProperties} from 'react'
import {useGetUserByIdQuery} from 'store/api';

const styles:Record<string, CSSProperties> = {
	main: {
		backgroundColor: "rgba(50,50,50, 0.75)",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		textAlign: "center",
	},
	avatar: {
		flexBasis: "200px",
		flexGrow: 0,
		flexShrink: 1,
		aspectRatio: "1",
		height: "auto",
		width:  "auto",
		marginLeft:  "auto",
		marginRight: "auto",
		marginTop: "5vh",
	},
	message: {
		flexGrow: 0,
		flexShrink: 1,
		fontSize: "5vh",
		color: "white",
	},
};


class EndgameProp {
	userId:string;
	style?:CSSProperties;
}

const EndgameScreen:React.FC<EndgameProp> = (p)=>{
	const { data:user } = useGetUserByIdQuery(p.userId);

	return <div style={{...styles.main, ...p.style}}>
		{ (user) && <>
			<Avatars id={user.avatar_id} style={styles.avatar}/>
			<p style={styles.message}>
				<b>{user.username}</b> wins&nbsp;!
			</p>
		</>}
	</div>
}

export default EndgameScreen;
