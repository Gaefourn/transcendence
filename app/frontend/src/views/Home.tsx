import TopBar from 'components/TopBar';
import React, {CSSProperties, useEffect} from 'react';
import {useGetConnectedChannelsQuery, useGetMeQuery} from 'store/api';
import {Navigate, Route, Routes, useLocation, useMatch, useNavigate} from 'react-router-dom';

import {useDispatch} from 'react-redux';
import {connect} from 'store/chatSocket';
import Social from 'views/Social';
import { useChannelLocation } from 'hooks/useChannelLocation';
import Leaderboard from 'views/Leaderboard';
import { Profile } from 'views/ProfileView';
import { GameView } from 'views/GameView';
import AchievementToast from 'components/achievements/AchievementToast';

const	styles: Record<string, CSSProperties> = {
	main: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
	},
	content: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'stretch',
		overflow: 'hidden'
	},
	channels: {
		width: 240,
		flexGrow: 0,
	}
}

const	Home: React.FC = () => {
	const { error } = useGetMeQuery();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		dispatch(connect());
	}, [dispatch]);

	useEffect(() => {
		if (error)
			navigate('/', { replace: true });
	}, [error, navigate]);

	return (
		<div style={styles.main}>
			<TopBar/>
			<AchievementToast/>
			<div style={styles.content}>
				<Routes>
					<Route path="/leaderboard" element={<Leaderboard/>}/>
					<Route path="/profile">
						<Route path=":id" element={<Profile />}/>
						<Route path="" element={<Profile />}/>
					</Route>
					<Route path="/game/:id" element={<GameView />}/>
					<Route path="/*" element={<Social />} />
				</Routes>
			</div>
		</div>
	);
}

export default Home;
