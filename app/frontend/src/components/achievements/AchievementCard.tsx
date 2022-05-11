import React, { CSSProperties } from 'react'
import { AchievementUnlockDTO } from 'store/dtos/AchievementUnlock.dto'
import { GetTrophyCosmetics } from './AchievementCosmetics'

import trophyGold   from "img/trophy-gold.png"
import trophySilver from "img/trophy-silver.png"
import trophyBronze from "img/trophy-bronze.png"
import trophyLocked from "img/trophy-locked.png"

const styles:Record<string, CSSProperties> = {
	main:{
		display:"flex",
		flexDirection:"row",
		alignItems: "center",
		height: "46px",
		padding: "10px",
		margin: "5px",
		color: "white",
		backgroundColor: "rgb(60, 65, 75)",
		borderRadius: "5px",
		borderStyle: "solid",
		borderWidth:0,
		// borderTopWidth: 2,
		borderLeftWidth: 3,
		borderRightWidth: 3,
	},
	name: {
		fontSize: "0.9em",
		margin: "0",
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
	description: {
		fontSize: "0.7em",
		margin: 0,
		color: "lightgrey",
	},
	icon:{
		margin: "10px",
		marginLeft: 0,
		height: "100%",
		width: "auto",
		objectFit: "contain",
		flexGrow: 0,
	},
	progressContainer: {
		height: "0.7em",
		padding: "1px",
		border: "solid 1px",
		borderColor: "darkcyan",
		borderRadius: "4px",
	},
	progressContent: {
		height:"100%",
		backgroundColor: "mediumturquoise",
		borderRadius: "3px",
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
	},
};

function CssProgress(current:number, max:number):string|undefined{
	if (!current || !max)
		return undefined;
	else
		return Math.floor(100 * current / max) + "%";
}

class TrophyCardProp {
	unlockInfo:AchievementUnlockDTO;
	hidden?:boolean;
}

const AchievementCard:React.FC<TrophyCardProp> = (p)=>{
	const cosmetics = GetTrophyCosmetics(p.unlockInfo.id, p.unlockInfo.level);
	const isLocked = !p.unlockInfo.date;
	const unlockDate = p.unlockInfo.date ? new Date(p.unlockInfo.date).toDateString() : undefined;
	const progress = isLocked && CssProgress(p.unlockInfo.progress, p.unlockInfo.progress_max);


	const mainStyle = {...styles.main};
	let iconSrc:string;
	if (isLocked){
		mainStyle.borderColor = "darkslategrey";
		iconSrc = trophyLocked;
	}
	else switch (cosmetics.visualLevel){
		default:
		case 2:
			mainStyle.borderColor = "gold";
			iconSrc = trophyGold ;
			break;
		case 1:
			mainStyle.borderColor = "silver";
			iconSrc = trophySilver ;
			break;
		case 0:
			mainStyle.borderColor = "chocolate";
			iconSrc = trophyBronze ;
			break;
	};

	return <div style={mainStyle} title={cosmetics?.description}>
		<img style={styles.icon} src={iconSrc} alt="trophy" />
		<div style={{width: "100%"}}>
			<h6 style={styles.name} title={cosmetics.name}>{cosmetics?.name ?? cosmetics.category+cosmetics.level}</h6>
			<p style={styles.description}>{p.hidden ? "???" : cosmetics?.description}</p>
			{unlockDate && <p style={styles.description}>{unlockDate}</p>}
			{progress && <div style={styles.progressContainer}>
				<div style={{...styles.progressContent, width: progress }} />
			</div>}
		</div>
	</div>
};

export default AchievementCard;
