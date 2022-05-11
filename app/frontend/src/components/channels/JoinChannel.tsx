import React, {CSSProperties, useCallback, useEffect, useMemo, useState} from 'react';

import { Modal } from 'components/Modal';
import {Autocomplete, styled, TextField} from '@mui/material';
import { useJoinChannelMutation, useLazyGetAvailableChannelsQuery} from 'store/api';
import debounce from "lodash/debounce";

import {Channel, ChannelDesc} from 'store/types/channel';
import {useNavigate} from 'react-router-dom';

const styles: Record<string, CSSProperties> = {
  button: {
    height: "32px",
    fontWeight: "bold",
    flex: 1,
    margin: '0px 4px',
    fontSize: "16px",
    borderRadius: "8px",
  },
  channels: {
    display: "flex",
    flexDirection: "column",
  },
  elem: {
    marginBottom: "20px",
    color: "#C4C4C4",
  },
  error: {
    alignSelf: 'center',
  },
}

const Error = styled('div')(({ theme }) => ({
  color: theme.palette.error.main,
  padding: 8,
  display: 'flex',
  justifyContent: 'center' as const,
  alignItems: 'center',
}));

const JoinChannel: React.FC<{ joined: Channel[] }> = ({ joined }) => {
  const [joinChannel, { isError: joinError, error: error_msg}] = useJoinChannelMutation();
  const [ fetch, { isLoading, data: channels = [] } ] = useLazyGetAvailableChannelsQuery();
  const navigate = useNavigate();
  const [ joinName, setJoinName ] = useState<string>("");
  const [ joinPwd, setJoinPwd ] = useState<string>("");
  const [ prot, setProtected ] = useState(true);

  const getOptions = useMemo(() => debounce(fetch, 200), [fetch]);
  useEffect(() => () => { getOptions.cancel(); }, [getOptions]);
  useEffect(() => {getOptions(joinName); }, [getOptions, joinName]);
  useEffect(() => { if (!prot && joinPwd) setJoinPwd(""); }, [prot, joinPwd, setJoinPwd]);

  const validateJoin = async () => {
    if (joinName)
    {
      const result = await joinChannel({ name: joinName, password: joinPwd || undefined });
      if ('data' in result)
      {
        navigate('/', { state: { channel: result.data.id!, dm: false } });
        return true;
      }
    }
    return false;
  };

  const onChange = (v: ChannelDesc | null) => {
    if (v) {
      setJoinName(v.name);
      setProtected(v.protected);
    }
  }

  const reset = () => {
    setJoinName('');
    setJoinPwd('');
    setProtected(true);
  }

  return (
    <Modal title="Join a channel"
           action="JOIN" validate={validateJoin} cancel={false} buttonStyle={styles.button} onClose={reset}>
      <Autocomplete
        isOptionEqualToValue={(opt, value) => opt.id === value.id}
        inputValue={joinName}
        clearOnBlur={false}
        loading={isLoading}
        onInputChange={(_, v, event) => { if (event === 'clear') reset(); }}
        onChange={(e, v) => onChange(v)}
        renderInput={(params) =>
        <TextField style={styles.elem} {...params} error={joinError} placeholder="Channel name"
          onChange={(e) => {
            setJoinName(e.target.value);
            setProtected(true);
          }} /> }
        options={channels}
        filterOptions={(options, params) => options.filter(e => !joined.find(j => j.id === e.id))}
        getOptionLabel={(opt) => opt.name} />
      <TextField style={styles.elem} value={joinPwd} onChange={(e) => setJoinPwd(e.target.value)}
          error={joinError} type="password" disabled={!prot} placeholder="Password" />
      {joinError && error_msg && 'data' in error_msg &&
      <Error style={styles.error}>
          <p>{ (error_msg.data as { message: string}).message}</p>
      </Error>
      }
    </Modal>
  );
}

export default JoinChannel;
