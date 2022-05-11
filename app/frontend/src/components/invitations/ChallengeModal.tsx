import React, { CSSProperties, useState } from "react";
import { FormControlLabel, Switch } from '@mui/material';
import { ChallengeFormDTO } from "store/dtos";
import { User } from "store/types/user";
import { Modal as ModalButton } from "components/Modal";
import { GameSocket } from "store/gameSocket";

const info = {
	acceleration: "The ball will gradually go faster everytime it is deflected.",
	gravity: "The ball's trajectory will curve downward.",
};

function Toggle(p:{label:string, info?:string, value:boolean, action:(v:boolean)=>any}){
	return (
		<FormControlLabel
			label={p.label}
			title={p.info}
			control={<Switch
				checked={p.value}
				onChange={(e) => {p.action(e.target.checked)}}
			/>}
		/>
	);
}

class ChallengeModalProp 
{
	buttonStyle:CSSProperties;
	user:User;
}

const ChallengeModalButton:React.FC<ChallengeModalProp> = (prop:ChallengeModalProp)=>{
	const [isCustom, setIsCustom] = useState(false);
	const [hasGravity, setGravity] = useState(false);
	const [hasAcceleration, setAcceleration] = useState(false);
	const sock = GameSocket.Connect();


	async function SendInvite(){
		let invite:ChallengeFormDTO = {
			recipientId: prop.user.id,
			customSettings: (!isCustom) ? undefined : {
				acceleration: hasAcceleration,
				gravity: hasGravity,
			},
		}

		sock.SendInvite(invite);
		return true;
	}

	return (
		<ModalButton
			action="Challenge"
			buttonStyle={prop.buttonStyle}
			title={`Invite ${prop.user.username} to play`}
			validate={SendInvite}
			cancel={true}
		>
			<Toggle label="Custom Rules" value={isCustom} action={setIsCustom} />
			{
				isCustom && <>
					<hr style={{width:"99%"}}/>
					<Toggle label="Ball acceleration" info={info.acceleration} value={hasAcceleration} action={setAcceleration}/>
					<Toggle label="Ball gravity"      info={info.gravity}      value={hasGravity}      action={setGravity}     />
				</>
			}
		</ModalButton>
	);
}

export default ChallengeModalButton;
