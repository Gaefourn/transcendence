import React, {CSSProperties} from 'react';
import {Button, Popover} from '@mui/material';
import PopoverContent from './PopoverContent';
import {Status, User} from 'store/types/user';
import {useGetMeQuery, useGetUserByIdQuery} from 'store/api';
import Avatars from './Avatars';

const styles: Record<string, CSSProperties> = {
    main: {
        display: "flex",
        width: "100%",
        flexDirection: "column",
    },
    card: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "stretch",
        overflow: "auto",
    },
    title: {
        textOverflow: "ellipsis",
        overflow: "hidden",
        paddingLeft: '8px',
        color: "#a4a4a4",
        textTransform: "none",
        fontSize: 16,
        margin: '8px',
    }
}

type Props = {
    user: User;
}

const colors = {
    [Status.Online]: "green",
    [Status.Offline]: "grey",
    [Status.Playing]: "yellow",
}

const makeStatus = (status: Status): CSSProperties => {
    return ({
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: "10px",
        height: "10px",
        borderRadius: '7px',
        border: "2px solid #282c34",
        backgroundColor: colors[status]
    });
}

export const FetchCard: React.FC<{ id: string }> = ({ id }) => {
    const { data: user } = useGetUserByIdQuery(id);

    return <>{ user && <UserCard user={user} />}</>
}

const UserCard: React.FC<Props> = ({ user }) => {
    const { data: other } = useGetUserByIdQuery(user.id);
    const { data: me } = useGetMeQuery();
    const { username } = user;
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => { setAnchorEl(null); };

    const open = Boolean(anchorEl);
    return (
        <div style={styles.main}>
            <Button sx={styles.card} onClick={handleClick}>
                <div style={{position: 'relative'}}>
                    <Avatars id={other?.avatar_id} />
                    {other?.status !== undefined ? <div style={makeStatus(other.status)} /> : "" }
                </div>
                <div style={styles.title}>{username}</div>
            </Button>
            { (me?.id !== user.id) &&
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center"
              }}
              transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
              }}
            >
                {other && <PopoverContent user={other} close={handleClose} />}
            </Popover>
            }
        </div>
    )
}

export default UserCard;
