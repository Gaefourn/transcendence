import React, {CSSProperties, useCallback, useEffect, useMemo} from 'react';
import {Navigate, Route, Routes, useNavigate} from 'react-router-dom';
import Channels from 'views/Channels';
import EditChannel from 'views/EditChannel';
import Chat from 'views/Chat';
import {useGetChannelQuery, useGetConnectedChannelsQuery, useGetMeQuery, useGetUserByIdQuery} from 'store/api';
import UsersList from 'components/UsersList';
import {useChannelLocation} from 'hooks/useChannelLocation';
import {User} from 'store/types/user';
import {ChannelData, JoinData, newDM} from 'store/chatSocket';
import {useEvent} from 'hooks/useEvent';
import {useAppDispatch, useAppSelector} from 'store';

const styles: Record<string, CSSProperties> = {
  content: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "stretch",
    color: "white",
    height: '100%'
  },
  channels: {
    width: 240,
    flexGrow: 0,
  },
  chat: {
    flex: 1,
    backgroundColor: "#36393F",
    display: 'flex',
    justifyContent: 'center',
    overflow: "auto"
  },
  users: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "auto",
    width: 240,
    flexGrow: 0,
  },
};

type Props = { users: string[], muted: boolean };

const ChannelUsers: React.FC<{ id: string, children: (users: string[], muted: boolean) => React.ReactNode }> = ({ id, children }) => {
  const { data: channel } = useGetChannelQuery(id);
  return <>{children(channel?.users || [], channel?.muted || false)}</>
}

const DmUsers: React.FC<{ id: string, children: (users: string[], muted: boolean) => React.ReactNode }> =({ id, children }) => {
  const { data: me } = useGetMeQuery();
  const users = me ? [id, me.id] : [];
  return <>{ children(users, false)}</>
}

const UserList: React.FC<{ id?: string, dm: boolean }> = ({ dm, id }) => {
  const render = (users: string[]) => <UsersList style={styles.users} users={users} />;
  if (!id)
    return render([]);

  return dm ? <DmUsers id={id}>{render}</DmUsers> : <ChannelUsers id={id}>{render}</ChannelUsers>
}

const WithUsers: React.FC<{dm: boolean, id: string }> = ({ dm, id }) => {
  if (dm)
    return <Chat style={styles.chat} muted={false} channel={id} is_dm={dm} />
  return <ChannelUsers id={id}>{(_, muted) => <Chat style={styles.chat} muted={muted} channel={id} is_dm={false} />}</ChannelUsers>;
}

const Social: React.FC = () => {
  const { data: rawChannels } = useGetConnectedChannelsQuery();
  const { channel: current, dm, pathname, except } = useChannelLocation();
  const conversations = useAppSelector(state => state.chat.conversations);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const channels = useMemo(() => rawChannels || [], [rawChannels]);

  useEffect(() => {
    if (current)
    {
      if (dm && conversations.indexOf(current) === -1)
        dispatch(newDM(current));
      return ;
    }
    let av = channels.filter(({ id }) => except.indexOf(id) === -1);
    if (av.length)
      navigate('/', { state: { channel: av[0].id }, replace: true });
  }, [channels, rawChannels, current, navigate, except, conversations, dispatch, dm]);

  useEvent('kicked', ({ channel }: ChannelData) => {
    if (channel === current) {
      let left = channels.filter(e => e.id !== channel);
      if (left.length)
        navigate('/', { state: { channel: left[0].id , dm: false }, replace: true });
      else
        navigate('/', { state: { except: [channel] }, replace: true });
    }
  }, [channels, current, pathname, navigate]);

  return (
    <div style={styles.content}>
      <Channels style={styles.channels} channels={channels} current={current} />
      <Routes>
        <Route path="/edit" element={<div style={styles.chat}>
          {!dm && current && <EditChannel id={current} />}
          </div>} />
        <Route path="/" element={current ? <WithUsers id={current} dm={dm} /> : <div style={styles.chat} />} />
        <Route path="*" element={<Navigate to='/' replace />} />
      </Routes>
      <UserList id={current} dm={dm} />
    </div>
  );
};

export default Social;
