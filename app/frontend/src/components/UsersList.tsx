import { Divider, TextField} from '@mui/material';
import React, {CSSProperties, useState} from 'react';
import {useGetFriendsQuery, useGetUserByIdQuery} from 'store/api';
import UserCard from './UserCard';
import { User } from 'store/types/user';
import InvitationList from "./invitations/InvitationList";
import {WithUser} from 'components/loaders/user';

const styles: Record<string, CSSProperties> = {
    main: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    searchBar: {
        display: 'flex',
        backgroundColor: '#36393F',
        margin: '10px',
    }
}

type Props = {
    style: React.CSSProperties,
    users: string[]
  }

const UsersList: React.FC<Props> = ( {style, users } ) => {
    const { data: friends = [] } = useGetFriendsQuery();
    const [searchTerm, setSearchTerm] = useState("");

    const match = (user: User) => !searchTerm || user.username.toLowerCase().includes(searchTerm.toLowerCase());

    return (
        <div style={{...styles.main, ...style}}>
            <TextField style={styles.searchBar}
                       type="text"
                       placeholder="Search..."
                       onChange={event => {setSearchTerm(event.target.value)}}
                       size={"small"}
            />
            <InvitationList/>
            {friends.length ? <>
                <Divider sx={{
                    '::before': { top: "0%" },
                    '::after': { top: "0%" }}}>
                    Friends - {friends.length}</Divider>
                {friends.map(e => <WithUser key={e} id={e}>{(user) => match(user) ? <UserCard user={user} /> : <></>}</WithUser>)}
            </> : <></>
            }
            {users.length ? <>
            <Divider sx={{
                '::before': { top: "0%" },
                '::after': { top: "0%" }}}>
            Channel - {users.length}</Divider>
            {users.map(e => <WithUser key={e} id={e}>{(user) => match(user) ? <UserCard user={user} /> : <></>}</WithUser>)}
            </> : <></>}
        </div>
    );
}

export default UsersList;
