import React, { useState, CSSProperties } from 'react';
import { Snackbar } from '@mui/material'
import { useGameSocket } from 'hooks/useSocket'
import { TrophyToastDTO } from 'store/dtos'
import AchievementCard from './AchievementCard';
import { AchievementUnlockDTO } from 'store/dtos/AchievementUnlock.dto';

const ForwardCard = React.forwardRef<any, TrophyToastDTO & {style?:any}>((props, ref)=>{
	const unlockInfo:AchievementUnlockDTO = {
		id: props.id,
		level: props.level,
		date: new Date().toISOString(),
		progress: 0,
		progress_max: 0,
	};
	return <div ref={ref} {...props} style={{minWidth: "300px", ...props.style}}>
		<AchievementCard
			unlockInfo={unlockInfo}
			hidden={false}
		/>
	</div>
})

const AchievementToast:React.FC = ()=>{
	const [queue, setQueue] = useState<TrophyToastDTO[]>([]);

	useGameSocket<void>("trophy-unlocked", undefined, (trophy:TrophyToastDTO)=>{
		queue.push(trophy);
		setQueue([...queue]);
	});
	
	const current = queue[0];
	if (!current)
		return <></>
	else 
		return <Snackbar
			open={!!current}
			onClose={()=>{queue.shift(); setQueue([...queue])}}
			autoHideDuration={6_000}
			anchorOrigin={{vertical:"bottom", horizontal:"right"}}
			key={current.id+current.level}
		>
			<ForwardCard {...current}/>
		</Snackbar>
}

export default AchievementToast;
