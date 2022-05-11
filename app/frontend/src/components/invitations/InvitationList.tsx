import React, { CSSProperties } from 'react';
import { Button, ButtonProps, Divider } from '@mui/material';
import { useAppSelector } from 'store';
import { useGetUserByIdQuery } from 'store/api';
import { GameSettingsDTO, InviteDTO } from 'store/dtos';
import { Modal as ModalButton } from 'components/Modal';
import UserCard from 'components/UserCard';
import Avatars from 'components/Avatars';
import { GameSocket } from 'store/gameSocket';

const styles:Record<string, CSSProperties> = {
	main: {
		width: "100%",
		paddingTop: "2px",
		paddingBottom: "2px",
	},
	flexRow: {
		display: "flex",
		flexDirection: "row",
	},
	incomingInviteCard: {
		marginTop: "16px",
		marginBottom: "16px",
	},
	userCard: {
		display: "flex",
		flexDirection: "row",
		height: "30px",
		width: "100%",
		padding: "0",
		textTransform: "none",
	},
	userAvatar:{
		width: "auto",
		height: "32px",
	},
	incomingButtonList:{
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
	},
	incomingUser: {
		margin: '8px',
		display: 'flex',
		alignItems: 'center'
	},
	incomingButton:{
		height: "25px",
		textTransform: "none",
		margin: "8px",
		flexBasis: "50%",
		flexGrow: "0",
		flexShrink: "1",
	},
	outgoingButton:{
		height: "25px",
		textTransform: "none",
		flexShrink: "1",
		margin: "auto",
		marginRight:"5px",
	},
	outgoingUsername: {
		width: "100%",
		textTransform: "none",
		textAlign: "left",
		margin: 0,
	},
};

const buttons:Record<string, Partial<ButtonProps>> = {
	accept: {
		children: <>Accept</>,
		variant: "contained",
		color: "primary",
		style: styles.incomingButton,
	},
	decline: {
		children: <>Decline</>,
		variant: "outlined",
		color: "error",
		style: styles.incomingButton,
	},
	details: {
		children: <>Details</>,
		variant: "outlined",
		color: "info",
		style: styles.incomingButton,
	},
	revoke: {
		children: <>Revoke</>,
		variant: "contained",
		color: "warning",
		style: styles.outgoingButton,
	},
	outgoingUsername: {
		variant: "text",
		color: "warning",
		style: styles.outgoingUsername,
	},
	incomingUsername: {
		variant: undefined,
		color: "inherit",
		style: styles.userCard,
	}
};

class InviteModalProp {
	userId:string;
	inviteId:string;
	gameSettings?:GameSettingsDTO;
	variant:"outgoing"|"incoming";
	buttonProps?: Partial<ButtonProps>;
}

const InviteDisplayModal:React.FC<InviteModalProp> = (prop) =>{
	const { data: user, isSuccess } = useGetUserByIdQuery(prop.userId);

	const sock = GameSocket.Connect();
	const settings = prop.gameSettings;
	const outgoing = (prop.variant === "outgoing");
	const username = user?.username;

	async function revoke(){ sock.RevokeInvite(prop.inviteId); return false; }
	async function accept(){ sock.AcceptInvite(prop.inviteId); return false; }

	const actionName  = (outgoing) ? "Revoke" : "Accept";
	const validate    = (outgoing) ? revoke : accept;
	const title       = (outgoing) ? `You invited ${username} to play` : `${username} invited you to play`;
	const actionProps = (outgoing) ? { color:"error" as ButtonProps["color"] } : undefined;
	return (
		<ModalButton
			buttonProps={prop.buttonProps}
			action={actionName}
			actionProps={actionProps}
			title={title}
			validate={validate}
			cancel={true}
		>
			{(isSuccess) && <UserCard user={user!}/>}
			{(settings) && <>
				<hr style={{width:"99%"}}/>
				<div>
					<p>This game will use custom rules.</p>
					<ul>
						{(settings.acceleration) && <li>Ball Acceleration</li>}
						{(settings.gravity)      && <li>Ball Gravity     </li>}
					</ul>
				</div>
			</>}
		</ModalButton>
	);
}

const OutgoingPreview:React.FC<{invite:InviteDTO}> = ({invite}) => {
	const { data: user, isSuccess } = useGetUserByIdQuery(invite.recipientId);
	const sock = GameSocket.Connect();

	function revoke(){ sock.RevokeInvite(invite.id); }

	if (!isSuccess)
		return <></>;

	const alignedUsername = <p style={styles.outgoingUsername}>{user?.username}</p>
	return (
		<div style={styles.flexRow}>
			<InviteDisplayModal
				buttonProps={{...buttons.outgoingUsername, children:alignedUsername}}
				userId={invite.recipientId}
				inviteId={invite.id}
				gameSettings={invite.customSettings}
				variant="outgoing"
			/>
			<Button {...buttons.revoke} onClick={revoke}/>
		</div>
	);
}

const IncomingPreview:React.FC<{invite:InviteDTO}> = ({invite}) => {
	const { data: user, isSuccess } = useGetUserByIdQuery(invite.senderId);
	const sock = GameSocket.Connect();

	function decline(){ sock.RefuseInvite(invite.id); }
	function accept (){ sock.AcceptInvite(invite.id); }

	if (!isSuccess)
		return <></>;

	const incomingUsercard = <div style={styles.incomingUser}>
		<Avatars id={user?.avatar_id} style={styles.userAvatar}/>
		<div style={{ paddingLeft: 8 }}>{user?.username}</div>
	</div>
	return (
		<div style={styles.incomingInviteCard}>
			<InviteDisplayModal
				buttonProps={{...buttons.incomingUsername, children:incomingUsercard}}
				userId={invite.senderId}
				inviteId={invite.id}
				gameSettings={invite.customSettings}
				variant="incoming"
			/>
			<div style={styles.incomingButtonList}>
				<Button {...buttons.accept } onClick={accept }/>
				<Button {...buttons.decline} onClick={decline}/>
				{(invite.customSettings) &&
				<InviteDisplayModal
					buttonProps={buttons.details}
					userId={invite.senderId}
					inviteId={invite.id}
					gameSettings={invite.customSettings}
					variant="incoming"
				/>}
			</div>
		</div>
	);
}

const InvitationList:React.FC = () => {
	const outInvite = useAppSelector(slice => slice.game.outInvite);
	const inInvite  = useAppSelector(slice => slice.game.inInvite );

	let outInvList:JSX.Element[] = [];
	for (let inv of Object.values(outInvite)) {
		outInvList.push(<OutgoingPreview
			key={`out-${inv.id}`}
			invite={inv}
		/>);
	}

	let inInvList:JSX.Element[] = [];
	for (let inv of Object.values(inInvite)) {
		inInvList.push(<IncomingPreview
			key={`in-${inv.id}`}
			invite={inv}
		/>);
	}

	const hasOut = (outInvList.length > 0);
	const hasIn  = ( inInvList.length > 0);
	return (<>
		{ (hasOut || hasIn) &&
			<div style={styles.main}>
				<Divider>Invitations</Divider>
				{outInvList}
				{(hasOut && hasIn) && <Divider/>}
				{inInvList}
			</div>
		}
	</>);
}

export default InvitationList;
