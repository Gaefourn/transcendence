import React, {CSSProperties, useCallback, useEffect, useState} from 'react';
import {Button, Divider} from '@mui/material';

import {User} from 'store/types/user';

import {
  useBanMutation,
  useDemoteMutation, useGetUserByIdQuery,
  useMuteMutation,
  usePromoteMutation, useUnBanMutation, useUnMuteMutation,
} from 'store/api';
import {Modal} from 'components/Modal';
import Time from 'components/Time';
import {useCountdown} from 'hooks/useCountdown';
import Avatars from 'components/Avatars';
import {WithUser} from 'components/loaders/user';

const styles: Record<string, CSSProperties> = {
  main: {
    display: "flex",
    flexDirection: "column",
  },
  left: {
    marginLeft: "8px",
  },
  content: {
    display: "flex",
    flexDirection: "row",
    margin: "8px",
    alignItems: 'center',
  },
  buttonContent: {
    display: "flex",
    flex: 1,
    justifyContent: "flex-end",
  },
  button: {
    margin: "0 8px 0 8px",
    fontSize: "16px",
    borderRadius: "8px",
    width: 140
  },
  admin: {
    color: '#f44336'
  },
}

type CardProps = {
  children: React.ReactNode;
  user: User;
  isAdmin: boolean;
}

const Card: React.FC<CardProps> = ({ user, isAdmin, children }) => {
  return <div style={styles.main}>
    <div style={styles.content}>
      <Avatars id={user.avatar_id} />
      <p style={isAdmin ? {...styles.admin, ...styles.left} : styles.left}>{user.username}</p>
      { children }
    </div>
  </div>
}

type BanProps = {
  until: Date;
  user: User;
  channel: string;
}

type TimerProps = {
  days: number,
  hours: number,
  minutes: number,
  seconds: number
}

export const Timer: React.FC<TimerProps> = ({ hours, days, minutes, seconds }) => {
  return <p  style={{margin : '0', alignSelf: 'center'}}>
    {days ? (days + "").padStart(2, "0") + ":" : ""}
    {hours ? (hours + "").padStart(2, "0") + ":" : ""}
    {(minutes + "").padStart(2, "0") + ":"}
    {(seconds + "").padStart(2, "0")}
  </p>
}

export const BanCard: React.FC<BanProps> = ({ user, until, channel }) => {
  const { done, ...timer } = useCountdown(until, 500);
  const [unbanned, setUnbanned] = useState(false);
  const [ unban ] = useUnBanMutation();
  const doUnban = useCallback(async () => {
    await unban({ user: user.id, channel });
    return true;
  }, [channel, unban, user.id]);

  useEffect(() => {
    if (done && !unbanned) {
      doUnban().then(() => setUnbanned(true));
    }
  }, [done, unbanned, doUnban]);

  return <Card isAdmin={false} user={user}>
    <div style={styles.buttonContent}>
      <Timer {...timer} />
      <Button style={styles.button} variant={'outlined'} onClick={doUnban} color={"error"}>Unban</Button>
    </div>
  </Card>
}

export const MuteButton: React.FC<BanProps> = ({ user, until, channel }) => {
  const { done, ...timer } = useCountdown(until, 500);
  const [unmute, setUnmute] = useState(false);
  const [ mute ] = useUnMuteMutation();
  const [ Hover, setHover ] = useState(false);

  const doUnMute = useCallback(async () => {
    await mute({user: user.id, channel});
    return true;
  }, [mute, user.id, channel]);

  useEffect(() => {
    if (done && !unmute) {
      doUnMute().then(() => setUnmute(true));
    }
  }, [done, unmute, doUnMute]);

  return(
    <Button style={styles.button} variant={'outlined'} onClick={doUnMute}
            onMouseLeave={()=>{setHover(false);}}
            onMouseEnter={()=>{setHover(true );}}>
      {Hover ? <Timer {...timer} /> : "Unmute"}
    </Button>
  );
}

type Props = {
  user: string;
  admin: boolean;
  channel: string;
  owned: boolean;
  disabled: boolean;
  muted?: string;
}

export const CardAdmin: React.FC<Props> = ({user: id, admin = true, channel,
  owned= false, disabled, muted }) => {
  const { data: user } = useGetUserByIdQuery(id);
  const [ demote, { isLoading: demLoad } ] = useDemoteMutation();
  const [ promote, { isLoading: promLoad } ] = usePromoteMutation();
  const [ ban ] = useBanMutation();
  const [ mute ] = useMuteMutation();

  const doBan = async () => {
    await ban({user: id, time: new Date((new Date().getTime() + 1000 * time)), channel});
    return true;
  }
  const doMute = async () => {
    await mute({user: id, time: new Date((new Date().getTime() + 1000 * time)), channel});
    return true;
  }

  const doDemote = async () => demote({ user: id, channel });
  const doPromote = async () => promote({ user: id, channel });
  const isLoading = demLoad || promLoad;

  const [time, setTime] = React.useState(60);

  return <WithUser id={id}>{(user) => <Card user={user} isAdmin={admin}>
      <div style={styles.buttonContent}>
        { owned ?
          <>
            {admin ?
              <Button style={styles.button} disabled={isLoading || disabled} variant={'outlined'} color='error' onClick={doDemote}>Demote</Button> :
              <Button style={styles.button} disabled={isLoading || disabled} variant={'outlined'} onClick={doPromote}>Promote</Button>}
            <Divider sx={{margin: '0px 8px'}} orientation='vertical' flexItem />
          </> :
          <></>
        }
        {muted ?
          <MuteButton user={user} channel={channel} until={new Date(muted)}/> :
          <Modal disabled={disabled || admin} action="Mute" validate={doMute} title={`Mute ${user.username} ?`}
                 buttonStyle={styles.button}>
            <Time onChange={setTime} action={"Muted"}/>
          </Modal>
        }
        <Modal disabled={disabled || admin} action="Ban" validate={doBan} title={`Ban ${user.username} ?`} buttonStyle={styles.button} actionProps={{ color:'error' }}>
          <Time onChange={setTime} action={"Banned"} />
        </Modal>
      </div>
    </Card>}
    </WithUser>;
}

