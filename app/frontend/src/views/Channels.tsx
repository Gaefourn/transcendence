import React, {CSSProperties, useEffect, useState} from 'react';
import {Button, Divider} from '@mui/material';

import {Channel} from 'store/types/channel';
import { useNavigate } from 'react-router-dom';
import CreateChannel from 'components/channels/CreateChannel';
import JoinChannel from 'components/channels/JoinChannel';
import {useAppSelector} from 'store';
import {ChannelButton, DmButton} from 'components/channels/Channel';
import {JoinData, middleware, SendData} from 'store/chatSocket';
import usePrevious from 'hooks/usePrevious';
import {useEvent} from 'hooks/useEvent';

const styles : Record<string, CSSProperties> = {
  main: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  button: {
    display: "flex",
    height: "54px",
    flexDirection: "row",
    justifyContent: "stretch",
    alignItems: "center",
    margin: "8px"
  },
  channel: {
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    flex: 1,
  },
  selected: {
    color: "#E47E35",
  },
};

type Props = {
  style: React.CSSProperties,
  channels: Channel[],
  current?: string,
}

const Channels: React.FC<Props> = ({ style, channels, current }) => {
  const conversations = useAppSelector(state => state.chat.conversations);
  const navigate = useNavigate();
  const prev = usePrevious(current);
  const [ unread, setUnread ] = useState<string[]>([]);

  useEvent('joined', ({ channel }: JoinData) => {
    if (channel !== current && !unread.find(e => e === channel))
      setUnread([...unread, channel]);
  }, [unread, setUnread, current]);

  useEvent('leave', ({ channel }: JoinData) => {
    if (channel !== current && !unread.find(e => e === channel))
      setUnread([...unread, channel]);
  }, [unread, setUnread, current]);

  useEvent('send', (data: SendData) => {
    const id = data.channel || data.sender!;
    if (id !== current && !unread.find(e => e === id)) {
      setUnread([...unread, id]);
    }
  }, [unread, setUnread, current]);

  useEffect(() => {
    if (current && prev !== current && unread.indexOf(current) !== -1)
      setUnread(unread.filter(e => e !== current));
  }, [unread, setUnread, current, prev]);

  const currentChannel = channels.find(e => e.id === current);

  return (
    <div style={{...styles.main, ...style}}>
      <div style={styles.button}>
        <CreateChannel/>
        <JoinChannel joined={channels}/>
      </div>
      {conversations.length ? <Divider sx={{'::before': { top: "0%" }, '::after': { top: "0%" },}}>Direct Messages</Divider> : ""}
      {current && conversations.map(e => <DmButton key={e} selected={current} id={e} unread={unread.indexOf(e) !== -1} />)}
      <Divider sx={{'::before': { top: "0%" }, '::after': { top: "0%" },}}>Channels</Divider>
      <div style={styles.channel}>
        {current && channels.map(channel => <ChannelButton key={channel.id} channel={channel} selected={current} unread={unread.indexOf(channel.id) !== -1}/>)}
      </div>
      <Divider />
      {
        (currentChannel?.owned || currentChannel?.admin) &&
        <Button onClick={() => navigate("/edit", { state: { channel: current }})}>Edit channel</Button>
      }
    </div>
  );
};

export default Channels;
