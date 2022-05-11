import React, {CSSProperties} from 'react';
import { useGetMatchHistoryQuery, useGetUserByIdQuery } from 'store/api';
import { GameHistory} from 'store/types/gameHistory';
import { User } from 'store/types/user';
import Avatars from './Avatars';
import Separated from 'components/Separated';

const styles: Record<string, CSSProperties> = {
    history: {
        display: 'flex',
        flexDirection: 'column',
        overflowY: "auto",
        flex: 1,
    },
    card: {
        position: 'relative',
        padding: "16px"
    },
    opponents: {
        display: "flex",
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    player: {
        display: "flex",
        alignItems: 'center',
        padding: "8px",
        flexBasis: 0,
        flex: 1,
    },
    time: {
      position: 'absolute',
      top: 8,
      right: 16,
      color: 'lightgray',
      textTransform: 'uppercase',
      fontSize: '12px'
    },
    title: {
        fontSize: '24px',
        paddingBottom: '16px',
        textAlign: 'center'
    },
}

const title = (won: boolean): CSSProperties => ({
    color: won ? 'green' : 'red',
    textAlign: 'center',
    textTransform: 'uppercase',
});

const player = (align: 'flex-start' | 'flex-end'): CSSProperties => ({
    ...styles.player,
    justifyContent: align
});

type PlayerProps = {
    user: User
};

const Player: React.FC<PlayerProps> = ({ user }) => {
    return <div style={player('flex-start')}>
        <Avatars id={user.avatar_id} />
        <div style={{paddingLeft: "8px"}}>{user.username}</div>
    </div>
}

type Props = {
    game: GameHistory;
    user: User;
}

const Card: React.FC<Props> = ({ game, user }) => {
    const { data: user1 } = useGetUserByIdQuery(game.user1.id);
    const { data: user2 } = useGetUserByIdQuery(game.user2.id);
    const won = game.winner === user.id;

    const format = new Date(game.ended);
    const locale = format.toLocaleDateString("fr-FR");

    return (
        <div style={styles.card}>
            <div style={styles.time}>{ locale }</div>
            <div style={title(won)}>{ won ? 'Victory' : 'Defeat' }</div>
            {user1 && user2 &&
            <div style={styles.opponents}>
                <div style={player('flex-start')}>
                   <Avatars id={user1.avatar_id} />
                    <div style={{paddingLeft: "8px"}}>{user1.username}</div>
                </div>
                <div style={{ width: '64px', textAlign: 'center' }}>{game.user1_score} - {game.user2_score}</div>
                <div style={player('flex-end')}>
                    <div style={{paddingRight: "8px"}}>{user2.username}</div>
                    <Avatars id={user2.avatar_id} />
                </div>
            </div>
            }
        </div>
    );
}

const MatchHistory: React.FC<{user: User, style: CSSProperties}> = ({ user, style }) => {
    const { data: history = [], isSuccess: successHistory }  = useGetMatchHistoryQuery(user.id)

    return (
        <div style={{...style, flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
            <div style={styles.title}>Match History</div>
            <div style={styles.history}>
                { successHistory &&
                history.map((val, i) => <Separated key={val.id} last={i === history.length - 1}>
                    <Card game={val} user={user}/>
                </Separated>)
                }
            </div>
        </div>
    );
}

export default MatchHistory;
