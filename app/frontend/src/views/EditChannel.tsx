import React from 'react';
import {DetailedChannel} from 'store/types/channel';
import {User} from 'store/types/user';
import {Divider} from '@mui/material';

import ParamsGeneral from 'components/channels/ParamsGeneral';
import {useGetChannelQuery, useGetMeQuery} from 'store/api';
import { BanCard, CardAdmin } from 'components/channels/CardAdmin';
import {Navigate} from 'react-router-dom';
import Separated from 'components/Separated';
import {WithUser} from 'components/loaders/user';

const styles: Record<string, React.CSSProperties> = {
  main: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    height: "fit-content",
    maxWidth: '60%'
  },
  input: {
    display: "flex",
    color: "#C4C4C4",
  },
  card: {
    marginBottom: "16px",
    borderRadius: "16px",
    backgroundColor: "#282c34",
    display: "flex",
    flexDirection: 'column',
    minWidth: "100%",
    margin: 'auto',
  },
}

type Props = {
  channel: DetailedChannel
}

const EditLoader: React.FC<{ id: string }> = ({ id }) => {
  const { data: channel, isLoading, isError } = useGetChannelQuery(id);
  return isLoading ? <></> : (
    isError ? <Navigate to='/' replace /> :
      <EditChannel channel={channel!} />);
}

const EditChannel: React.FC<Props> = ({ channel }) => {
  const {data: me} = useGetMeQuery();
  const { admins, others } = channel.users.reduce(({ admins, others }, current) => {
    if (channel.admins.indexOf(current) === -1)
      others.push(current);
    else
      admins.push(current);
    return { admins, others }
  }, { admins: [] as string[], others: [] as string[] });

  const disabled = (user: string) => user === me?.id || channel.owner === user;

  return (
    <div style={styles.main}>
      {channel.owned &&
      <>
          <ParamsGeneral channel={channel}/>
          <Divider style={{margin: '16px 0 16px 0'}}/>
      </>
      }
      <p style={{fontSize: '20px'}}> ADMINISTRATION</p>
      <p style={styles.input}>Channel users</p>
      <div style={styles.card}>
        {admins.map((user, i) =>
          <Separated key={user} last={i === admins.length - 1 && !others.length}>
            <CardAdmin user={user} disabled={disabled(user)} owned={channel.owned} admin={true} channel={channel.id}/>
          </Separated>)}
        {others.map((user, i) =>
          <Separated key={user} last={i === others.length - 1}>
            <CardAdmin muted={channel.muteList.find(e => e.user === user)?.until}
                       user={user} disabled={disabled(user)} owned={channel.owned} admin={false} channel={channel.id} />
          </Separated>
        )}
      </div>
      {channel.banList.length !== 0 &&
      <>
          <p style={styles.input}>Banned users</p>
          <div style={styles.card}>
            {channel.banList.map((ban, i) => <Separated key={ban.user} last={i === channel.banList.length - 1}>
              <WithUser id={ban.user}>{user => <BanCard user={user} channel={channel.id} until={new Date(ban.until)} />}</WithUser>
            </Separated>
            )}
          </div>
      </>
      }
    </div>
  );
}

export default EditLoader;
