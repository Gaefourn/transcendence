import React, {CSSProperties, useEffect, useState} from 'react';
import {DetailedChannel} from 'store/types/channel';
import {Button, FormControlLabel, styled, Switch, TextField} from '@mui/material';
import {usePrompt} from 'hooks/usePrompt';
import { useUpdateChannelMutation } from 'store/api';

const styles: Record<string, CSSProperties> = {
  main: {
    display: 'flex',
    flexDirection: 'column'
  },
  column: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  toggle: {
    maxWidth: 240,
    alignSelf: 'center',
    justifySelf: 'center',
    margin: 'auto',
  },
  buttonLeft: {
    margin: '0px 8px 0px 0px',
  },
  validate: {
    display: 'flex',
    alignSelf: 'center',
    margin: '16px 0',
  },
}

const Error = styled('div')(({ theme }) => ({
  color: theme.palette.error.main,
  padding: 8,
  display: 'flex',
  justifyContent: 'center' as const,
  alignItems: 'center',
}));

type Props = {
  channel: DetailedChannel
}

const ParamsGeneral: React.FC<Props> = ({ channel }) => {
  const [channelUpdate, { isLoading, isError: updateError, error: error_msg }] = useUpdateChannelMutation();

  const [name, setName] = useState(channel.name);
  const [is_private, setPrivate] = useState(channel.isPrivate);

  const [pwd, setPwd] = useState("");
  const [pwdCheck, setPwdCheck] = useState("");
  const [pwdError, setPwdError] = useState(false);

  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  const hasUpdates = name !== channel.name || is_private !== channel.isPrivate || pwd !== "" || open;
  usePrompt("You have unsaved changes ! Leave anyway ?", hasUpdates);

  useEffect(() => {
    setError(updateError);
  }, [updateError]);

  const removePwd = () => {
    channelUpdate({ id: channel.id, password: null });
  }

  const cancel = () => {
    setPwd('');
    setName(channel.name);
    setPrivate(channel.isPrivate);
    setPwdError(false);
    setPwdCheck("");
    setError(false);
    if(open)
      setOpen(false);
  };

  const update = async () => {
      const result = await channelUpdate({ id: channel.id, name: name, isPrivate: is_private, password: pwd || undefined });
      if ('data' in result)
      {
        setOpen(false);
        setPwd("");
        setPwdCheck("");
      }
  };

  return (
    <div style={styles.main}>
      <p style={{fontSize: "20px"}}>GENERAL</p>
      <div style={styles.column}>
        <p color={"#C4C4C4"}>Channel name</p>
        <TextField value={name} onChange={e => setName(e.currentTarget.value)}
                   onFocus={() => setError(false) }
                   error={error}/>
        { !open ?
          <div style={{ display: 'flex', justifyContent: 'flex-start', margin: "16px 0"}}>
            <Button style={styles.buttonLeft} variant="contained" onClick={() => setOpen(true)} >change password</Button>
            <Button style={styles.buttonLeft} variant="outlined" color="error" onClick={removePwd}>remove password</Button>
          </div>
          :
          <div style={styles.column}>
            <p>New Password</p>
            <TextField type="password" value={pwd} onChange={e => setPwd(e.currentTarget.value)}
                       onFocus={() => { setPwdError(false); setError(false); }}
                       onBlur={() => { setPwdError((!!pwd || !!pwdCheck) && pwd !== pwdCheck) }}
                       error={pwdError || error} helperText={pwdError && "Password does not match"} />
            <p>Retype Password</p>
            <TextField type="password" value={pwdCheck} onChange={e => setPwdCheck(e.currentTarget.value)}
                       onFocus={() => { setPwdError(false); setError(false); } }
                       onBlur={() => { setPwdError((!!pwd || !!pwdCheck) && pwd !== pwdCheck) }}
                       error={pwdError || error} helperText={pwdError && "Password does not match"} />
          </div>
        }
        <FormControlLabel sx={{marginTop: "8px", alignSelf: "flex-start"}}
          control={<Switch checked={is_private} onChange={() => setPrivate(!is_private)}/>}
          label="Private"
        />
        {error && error_msg && 'data' in error_msg &&
        <Error>
            <p>{ (error_msg.data as { message: string}).message}</p>
        </Error>
        }
        {hasUpdates &&
        <div style={styles.validate}>
            <Button style={styles.buttonLeft} variant="outlined" onClick={cancel}>Cancel</Button>
            <Button variant="contained" color="success" disabled={pwdError || pwd !== pwdCheck || (open && !pwd) || isLoading}
                    onClick={update}>Validate</Button>
        </div>
        }
      </div>
    </div>
  );
}

export default ParamsGeneral;
