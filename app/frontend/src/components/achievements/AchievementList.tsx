import React, { CSSProperties } from 'react'
import { Divider } from '@mui/material';
import AchievementCard from './AchievementCard';
import { GetTrophyCosmetics } from './AchievementCosmetics';
import { useGetUserAchievementsQuery } from 'store/api';

const styles:Record<string, CSSProperties> = {
	main: {
		display: "flex",
		flexDirection: "column",
		overflowY: "hidden",
		minWidth: "300px",
	},
};

class AchListProp {
	userId:string|"me";
	style?:CSSProperties;
}

const AchievementList:React.FC<AchListProp> = (p)=>{
	const {data: trophies} = useGetUserAchievementsQuery(p.userId, {refetchOnMountOrArgChange: true});
	const {data: myTrophies} = useGetUserAchievementsQuery("me");
	
	let locked:JSX.Element[] = [];
	let unlocked:JSX.Element[] = [];
	if (trophies) 
	for (let t of trophies) 
	if ( t.date || ( p.userId==="me" && !trophies.find(u=>(u.id===t.id && u.level<t.level && !u.date)) )) 
	{
		const ach = GetTrophyCosmetics(t.id, t.level);
		const hidden = ach.hidden && !!myTrophies?.find( u=>(u.id===t.id && u.level===t.level && !u.date) )
		const card = <AchievementCard 
			key={t.id+t.level}
			unlockInfo={t}
			hidden={hidden}
		/>;
		if (t.date)
			unlocked.push(card);
		else
			locked.push(card);
	}

	return <div style={{...styles.main, ...p.style}}>
		<h3>Achievements</h3>
		<div style={{overflowY: "auto"}}>
			{unlocked}
			{!!locked.length && !!unlocked.length && <Divider/>}
			{locked}
		</div>
	</div>
};

export default AchievementList;
