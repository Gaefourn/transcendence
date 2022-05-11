import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {Navigate, useNavigate} from 'react-router-dom';
import {useGetConnectedQuery, useLogoutMutation} from 'store/api';
import { disconnect as chatDisconnect } from 'store/chatSocket';
import { GameSocket } from 'store/gameSocket';

const LogoutView:React.FC = ()=>{
	const dispatch = useDispatch();
	const [httpLogout] = useLogoutMutation();
	const { data: connected } = useGetConnectedQuery();

	useEffect(() => {
		httpLogout();
	});

	if (!connected)
	{
		dispatch(chatDisconnect());
		GameSocket.Disconnect();
		return <Navigate to='/' replace={true} />
	}
	return <></>
}

export default LogoutView;
