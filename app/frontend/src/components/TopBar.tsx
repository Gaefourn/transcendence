import React, {CSSProperties} from 'react';
import { useGetMeQuery } from 'store/api';

import { useMatch, useNavigate  } from 'react-router-dom';
import {Button, Divider} from '@mui/material';
import GameButton from './GameButton';
import MatchButton from './MatchButton';
import Avatars from './Avatars';

const nav = (style: CSSProperties): CSSProperties => ({
    fontSize: "18px",
    color: "white",
    textTransform: "none",
    justifyContent: 'flex-start',
    paddingLeft: '16px',
    ...style
});

const styles: Record<string, CSSProperties> = {
    topBar: {
        display: "flex",
        flexShrink: 0,
        flexDirection: "row",
        justifyContent: "stretch",
        height: "64px",
        backgroundColor: "#282c34",
        borderBottom: "1px solid #1b1e24",
    },
    sides: {
        flex: 1,
        display: 'flex',
    },
    mainButton: {
        display: "flex",
    },
    profile: nav({
        width: "240px"
    }),
    nav: nav({
        width: '160px',
        display: 'flex',
        justifyContent: 'center',
    }),
    avatar: {
        height: "40px",
        width: "40px",
        borderRadius: "50%",
    },
    title: {
        textOverflow: "ellipsis",
        overflow: "hidden",
        marginLeft : "10px",
    },
    logout: {
        justifyContent: 'flex-end',
        flex: 1,
        display: 'flex'
    },
    logOutButton: {
        fontSize: "16px",
    }
}

const Browser: React.FC = () => {
    const { data: user } = useGetMeQuery();
    let navigate = useNavigate();

    const goProfile = () => {
        navigate('/profile');
    }

    const goLeaderboard = () => {
        navigate('/leaderboard');
    }

    return (
        <div style={styles.mainButton}>
            <Button style={styles.profile} onClick={goProfile}>
                { user && <Avatars id={user!.avatar_id} /> }
                <p style={styles.title}> {user?.username} </p>
            </Button>
            <Divider orientation="vertical" variant={"middle"} flexItem />
            <Button style={styles.nav} onClick={() => navigate('/')}><p>Home</p></Button>
            <Button style={styles.nav} onClick={goLeaderboard}> Leaderboard </Button>
        </div>
    );
    }

const LogOut: React.FC = () => {
    let navigate = useNavigate();

    function logout(){
        navigate("/logout");
    }

    return (
      <Button style={styles.logOutButton} onClick={logout}>
          Log Out
      </Button>
    );
}

const PlayButton: React.FC = () => {
    const gamePath = useMatch("/game/:id");

    if (gamePath)
        return <GameButton gameId={gamePath.params.id!}/>
    else
        return <MatchButton />
}

const TopBar: React.FC = () => {
    return (
        <div style={styles.topBar}>
            <div style={styles.sides}><Browser/></div>
            <div style={styles.mainButton}><PlayButton /></div>
            <div style={styles.logout}><LogOut /></div>
        </div>
    );
}

export default TopBar;
