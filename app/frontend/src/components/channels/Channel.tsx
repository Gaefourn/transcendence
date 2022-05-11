import React, {CSSProperties, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, IconButton, Dialog, DialogContent, DialogTitle, Badge} from '@mui/material';
import * as Channels from 'store/types/channel';
import {User} from 'store/types/user';
import ClearIcon from '@mui/icons-material/Clear';

import {
  useGetConnectedChannelsQuery,
  useGetConnectedQuery,
  useGetUserByIdQuery,
  useLeaveChannelMutation
} from 'store/api';
import {useAppDispatch} from 'store';

import { leave as leaveAction } from 'store/chatSocket';

const styles: Record<string, CSSProperties> = {
  button: {
    display: "flex",
    justifyContent: "flex-start",
    position: 'relative',
  },
  unread: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 6,
    width: 12,
    height: 12,
    left: -6
  },
  title: {
    flexDirection: "row",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    color: "white",
    padding: "0px 16px",
    margin: "4px",
    fontSize: "16px",
    textTransform: "none",
    width: "100%",
    textAlign: 'left',
  },
  selected: {
    color: "#E47E35",
  },
  modal: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  quit: {
    cursor: "pointer",
    color: "#C4C4C4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }
}

type ChannelProps = {
  selected: string,
  channel: Channels.Channel,
  unread: boolean
}

type DmProps = {
  selected: string,
  id: string,
  unread: boolean
}

export const ChannelButton: React.FC<ChannelProps> = ({ channel, selected, unread }) => {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const [leave] = useLeaveChannelMutation();
  const dispatch = useAppDispatch();

  const doLeave = async () => {
    const res = await leave(channel.id);
    if ('data' in res) {
      setOpen(false);
      dispatch(leaveAction(channel.id));
      navigate('/', { state: { except: [channel.id] } });
    }
  }

  return(
    <Button style={styles.button} key={channel.id}
                 onMouseEnter={() => setHover(true)}
                 onMouseLeave={() => setHover(false)}
                 onClick={() => navigate("/", { state: { channel: channel.id, dm: false } })}>
      { unread && <div style={styles.unread} /> }
      <div style={{...styles.title, ...(channel.id === selected && styles.selected)}}>
        {channel.name}
      </div>
      {hover ? <div style={styles.quit} onClick={(e) => {
        setOpen(true); e.preventDefault();
      }}><ClearIcon/></div> : <></>}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {"Sure to leave " + channel.name + " ?"}
        </DialogTitle>
          <DialogContent style={styles.modal}>
            <Button variant="contained" color="error" onClick={doLeave}> YES </Button>
            <Button variant="outlined" onClick={() => setOpen(false)}> NO </Button>
        </DialogContent>
      </Dialog>
    </Button>
  );
}

type UserProps = {
  id: string,
  children: (user: User) => React.ReactNode
}

const WithUser: React.FC<UserProps> = ({ id, children }) => {
  const { data: user, isLoading } = useGetUserByIdQuery(id);

  return <>
    {!isLoading && user && children(user)}
  </>
}

export const DmButton: React.FC<DmProps> = ({ id, selected, unread }) => {
  const navigate = useNavigate();

  return <WithUser id={id}>
    {(user) =>
      <Button style={styles.button} key={id}
              onClick={() => navigate("/", { state: { channel: id, dm: true } })}>
        { unread && <div style={styles.unread} /> }
        <div style={{...styles.title, ...(id=== selected && styles.selected)}}>{user.username}</div>
      </Button>
    }
  </WithUser>
}
