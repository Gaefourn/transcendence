import React, {CSSProperties} from 'react';
import {useGetBlockedQuery, useGetMeQuery, useGetUserByIdQuery} from 'store/api';
import {useParams} from 'react-router-dom';
import Avatars from 'components/Avatars';
import {User} from 'store/types/user';
import {FetchCard} from 'components/UserCard';
import EditButton from 'components/EditButton';
import TfaSwitch from 'components/TfaSwitch';
import MatchHistory from 'components/MatchHistory';
import AchievementList from 'components/achievements/AchievementList'

const styles: Record<string, CSSProperties> = {
    content: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: "#36393F",
        height: '100%'
    },
    panel: {
        display: 'flex',
        flexDirection: 'column',
        justifyItems: 'center',
    },
    card : {
        display: 'flex',
        backgroundColor: '#282c34',
        borderRadius: '12px',
        color: 'white',
        padding: '16px',
        margin: '8px',
    },
    name: {
        fontSize: '22px',
    },
    edit: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: '16px',
        alignSelf: 'stretch',
    },
    title: {
        fontSize: '24px',
        textAlign: 'center',
    },
}

type UserProps = {
    user: User,
    me: boolean
}

const Info: React.FC<UserProps> = ({ user, me }) => {
    return (
      <div style={{...styles.card, flexDirection: 'column', alignItems: 'center'}}>
          <Avatars style={{ height: "200px", width: "200px"}} id={user!.avatar_id} />
          <b style={styles.name}>{user?.username}</b>
          {me &&
          <div style={styles.edit}>
              <TfaSwitch checked={user?.isTwoFactorEnable || false}/>
              <EditButton id={user.id}/>
          </div> }
    </div>
    );
}

const BlockList: React.FC = () => {
    const { data: blocked = [] } = useGetBlockedQuery();

    return <div style={{...styles.card, overflowY: 'auto', flex: 1, flexDirection: 'column'}}>
          <div style={styles.title}>BlockList</div>
          {blocked.map(id => <FetchCard key={id} id={id} />)}
      </div>
}

const Stats: React.FC<UserProps> = ({user, me}) => {
    return (
        <div style={{...styles.card, flexDirection: 'row', justifyContent: 'space-between'}}>
            <div style={{ margin: "4px"}}>win: {user.win_number}</div>
            <div style={{ margin: "4px"}}>lose: {user.lose_number}</div>
            <div style={{ margin: "4px"}}>rating: {user.rating}</div>
        </div>
    );
}

type Props = {
    children: (props: UserProps) => React.ReactNode;
    id?: string;
}

const WithUser: React.FC<Props> = ({ id, children }) => {
    const { data: user } = useGetUserByIdQuery(id!);
    return <>{user ? children({ user, me: false }) : <div>Loading</div>}</>
}

const WithMe: React.FC<Props> = ({ children }) => {
    const { data: user } = useGetMeQuery();
    return <>{user ? children({ user, me: true }) : <div>Loading</div>}</>;
}

export const Profile: React.FC = () => {
    const { id } = useParams();
    const Loader = id ? WithUser : WithMe;

    return <Loader id={id}>
        {props => <div style={styles.content}>
            <div style={{...styles.panel}}>
                <Info {...props}/>
                <Stats {...props}/>
                { props.me && <BlockList /> }
            </div>
            <div style={{...styles.panel, width: '60%'}}>
                <MatchHistory style={styles.card} {...props}/>
            </div>
            <div style={{...styles.panel}}>
                <AchievementList userId={id ?? "me"} style={{...styles.card, flex: 1}}/>
            </div>
    </div>}
    </Loader>;
}
