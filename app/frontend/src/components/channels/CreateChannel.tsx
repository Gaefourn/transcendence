import React, {CSSProperties, useEffect, useState} from 'react';
import {FormControlLabel, styled, Switch, TextField} from '@mui/material';
import { Modal } from 'components/Modal';
import {useCreateChannelMutation} from 'store/api';

const styles: Record<string, CSSProperties> = {
  button: {
    height: "32px",
    fontWeight: "bold",
    flex: 1,
    margin: '0px 4px',
    fontSize: "16px",
    borderRadius: "8px",
  },
  elem: {
    marginBottom: "20px",
    color: "#C4C4C4",
  },
}

const Error = styled('div')(({ theme }) => ({
  color: theme.palette.error.main,
  padding: 8,
  display: 'flex',
  justifyContent: 'center' as const,
  alignItems: 'center',
}));


const CreateChannel: React.FC = () => {
  const [createChannel, {isError: createError, error : error_msg}] = useCreateChannelMutation();

  const [error, setError] = useState(false);
  const [ createName, setCreateName ] = useState<string>("");
  const [ createPwd, setCreatePwd ] = useState<string>("");
  const [ createPrivate, setCreatePrivate ] = useState<boolean>(false);

  useEffect(() => {
    setError(createError);
  }, [createError]);

  const cancel = () => {
    setCreateName("");
    setCreatePwd("");
    setCreatePrivate(false);
  };

  const validateCreate = async () => {
    if (createName)
    {
      const result = await createChannel({ name: createName, isPrivate: createPrivate, password: createPwd || undefined });
      return 'data' in result;
    }
    return false;
  };

  return (
    <Modal action="CREATE" validate={validateCreate} title="New channel" cancel={false} buttonStyle={styles.button} onClose={cancel}>
      <TextField style={styles.elem} value={createName} onChange={(e) => setCreateName(e.target.value)}
                 error={error} placeholder="Channel name" />
      <TextField style={styles.elem} value={createPwd} onChange={(e) => setCreatePwd(e.target.value)} type="password" error={error} placeholder="Password" />
      <FormControlLabel control={<Switch checked={createPrivate} onChange={(e) => setCreatePrivate(e.target.checked)} />} label="Private"/>
      {error && error_msg && 'data' in error_msg &&
      <Error>
          <p>{ (error_msg.data as { message: string}).message}</p>
      </Error>
      }
    </Modal>
  )
}

export default CreateChannel;
