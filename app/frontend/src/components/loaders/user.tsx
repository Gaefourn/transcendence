import React from 'react';
import {User} from 'store/types/user';
import {useGetUserByIdQuery} from 'store/api';

export const WithUser: React.FC<{ id: string, children: (user: User) => React.ReactNode}> = ({ id, children }) => {
  const { data: user } = useGetUserByIdQuery(id);

  return <>
    {user && children(user)}
  </>
}
