import {User} from 'store/types/user';

export type Channel = {
  id: string,
  name: string,
  owned: boolean,
  admin: boolean,
  isPrivate: boolean,
  admins: string[]
}

export type ChannelDesc = {
  id: string,
  name: string,
  protected: boolean
}

export type UserDuration = {
  until: string,
  user: string
}

export type DetailedChannel = {
  id: string,
  name: string,
  isPrivate: boolean,
  owner: string,
  owned: boolean,
  admins: string[],
  admin: boolean,
  users: string[],
  banList: UserDuration[],
  muteList: UserDuration[],
  muted: boolean
}

export type CreateChannelAction = {
  name: string,
  password?: string,
  isPrivate: boolean
}

export type JoinChannelAction = {
  name: string,
  password?: string,
}

export type Message = {
  sender: string,
  createdAt: string,
  content: string,
  error?: boolean
}

export type ChannelUpdate = {
  id: string,
  name: string,
  password?: string | null,
  isPrivate: boolean,
}
