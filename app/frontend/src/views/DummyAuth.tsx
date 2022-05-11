import React, {useEffect} from "react";
import { useParams } from "react-router";
import { Navigate } from "react-router-dom";
import {useDummyLoginMutation, useGetConnectedQuery} from "store/api";

const DummyAuth:React.FC = () => {
	const {data} = useGetConnectedQuery();
	const {name} = useParams();
	const [ connect ] = useDummyLoginMutation();

	useEffect(() => {
		connect(name!);
	});

	if (data)
		return <Navigate replace={true} to={"/"}/>;
	return <></>;
}

export default DummyAuth;
