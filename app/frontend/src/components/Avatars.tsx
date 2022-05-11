import { Avatar } from '@mui/material';
import React, {CSSProperties } from 'react'
import { useGetAvatarQuery } from 'store/api'
import defaultAvatar from "img/default-avatar.png";

type Props = {
    id?: string,
    style?: CSSProperties
}

const Default: React.FC<Props> = ({ style }) => {
    return <Avatar style={style} src={defaultAvatar} alt="avatar" />
}

const LoadAvatar: React.FC<Props> = ({ id, style }) => {
    const {data: avatar } = useGetAvatarQuery(id!);

    return avatar ? <Avatar style={style} src={avatar} alt="avatar" /> : <Default style={style} />;
}

const Avatars: React.FC<Props> = ({ children, ...props }) => {
    return props.id ? <LoadAvatar {...props} /> : <Default {...props} />
}

export default Avatars;
