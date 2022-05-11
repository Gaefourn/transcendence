import React, { CSSProperties } from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAddFriendMutation, useBlockUserMutation, useGetBlockedQuery, useGetFriendsQuery, useGetMeQuery, useGetUserCurrentGameQuery, useRemoveFriendMutation, useUnblockUserMutation } from 'store/api';
import {useDispatch} from 'react-redux';
import {newDM} from 'store/chatSocket';
import {User} from 'store/types/user';
import ChallengeModalButton from 'components/invitations/ChallengeModal';

const styles: Record<string, CSSProperties> = {
    main: {
        display: 'flex',
        flexDirection: 'column',
        width: '200px',
        overflow: "hidden",
        backgroundColor: "#202225",
    },
    buttons: {
        alignSelf: 'stretch',
        justifyContent: 'flex-start',
        textTransform: "none",
        color: "white",
        border: "none",
        padding: "8px 16px"
    },
}

type Props = {
    user: User;
    close: () => void;
}

const PopoverContent: React.FC<Props> = ( { user, close }) => {
    let navigate = useNavigate();
    const { data: friends = [] } = useGetFriendsQuery();
    const { data: blockedUsers = [] } = useGetBlockedQuery();
    const currentGame = useGetUserCurrentGameQuery(user.id, { refetchOnMountOrArgChange: true} ).data?.gameId;
    const [newFriend] = useAddFriendMutation();
    const [delFriend] = useRemoveFriendMutation();
    const [newBlock]  = useBlockUserMutation();
    const [delBlock]  = useUnblockUserMutation();
    const id = user.id;

    const dispatch = useDispatch();

    const isFriend  = friends.indexOf(id) !== -1;
    const isBlocked = blockedUsers.indexOf(id) !== -1;

    const redirect = () => { navigate(`/profile/${id}`); }
    const spectate = () => { navigate(`/game/${currentGame}`); }

    const friend = async () => {
        if (!isFriend && !isBlocked)
            await newFriend(id);
        else if (isFriend)
            await delFriend(id);
        close();
    }

    const sendMessage = () => {
        dispatch(newDM(user.id));
        navigate("/", { state: { channel: user.id, dm: true } });
        close();
    }

    const blockUser = async () => {
        if (!isFriend)
            newBlock(id).then(() => close());
    }

    const unblockUser = async () => delBlock(id).then(() => close());

    if (isBlocked)
        return (
          <div style={styles.main}>
            <Button sx={styles.buttons} onClick={redirect}> Profile </Button>
            <Button sx={styles.buttons} onClick={unblockUser}>Unblock</Button>
          </div>
        )
    return (
        <div style={styles.main}>
            <Button sx={styles.buttons} onClick={redirect}> Profile </Button>
            <Button sx={styles.buttons} onClick={friend}>
                {isFriend ? "Remove friend" : "Add friend"}
            </Button>
            <ChallengeModalButton user={user} buttonStyle={styles.buttons}/>
            {currentGame && <Button sx={styles.buttons} onClick={spectate}> Spectate </Button>}
            <Button sx={styles.buttons} onClick={sendMessage}> Send message </Button>
            { !isFriend && <Button sx={styles.buttons} onClick={blockUser}>Block</Button>}
        </div>
    );
}

export default PopoverContent;
