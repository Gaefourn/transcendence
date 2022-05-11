import {FetchArgs, fetchBaseQuery} from '@reduxjs/toolkit/query'
import { createApi } from '@reduxjs/toolkit/dist/query/react';

import { AuthData, User } from "./types/user";
import {
  Channel,
  DetailedChannel,
  ChannelUpdate,
  CreateChannelAction,
  JoinChannelAction,
  ChannelDesc
} from "store/types/channel";

import { GameHistory } from './types/gameHistory';
import { AchievementUnlockDTO } from './dtos/AchievementUnlock.dto';

export function POST<Data>(url: string, body: Data, headers?: Record<string, string | undefined>): FetchArgs {
  return {
    method: "POST",
    body,
    url,
    headers
  }
}

export function DELETE<Data>(url: string, body: Data, headers?: Record<string, string | undefined>): FetchArgs {
  return {
    method: "DELETE",
    body,
    url,
    headers
  }
}

export function PUT<Data>(url: string, body: Data, headers?: Record<string, string | undefined>): FetchArgs {
  return {
    method: "PUT",
    body,
    url,
    headers
  }
}

export const baseQuery = fetchBaseQuery({
    baseUrl: process.env.REACT_APP_HOST,
    credentials: "include"
  });

export const api = createApi({
  reducerPath: 'api',
  tagTypes: ['Channel', 'User', 'Game', 'Connected', 'UserTrophies'],
  baseQuery,
  endpoints: (builder) => ({
    getUserById: builder.query<User, string>({
      query: (id) => `users/${id}`,
      providesTags: (res, error, id) => [{ type: 'User', id }]
    }),
    getConnected: builder.query<boolean, void>({
      query: () => 'auth/connected',
      transformResponse: (res: { connected: boolean }) => res.connected,
      providesTags: ['Connected']
    }),
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: res => res ? [{ type: 'User' }, { type: 'User', id: res.id }] : ['User'],
    }),
    getAvatar: builder.query<any, string | undefined> ({
      query: (id) => ({
        url: `/avatars/${id}`,
        responseHandler: (res) => res.blob().then(blob => URL.createObjectURL(blob))
      }),
      providesTags: ['User']
    }),
    getAllUsers: builder.query<User[], void>({
      query: () => "/users"
    }),
    getMatchHistory: builder.query<GameHistory[], string>({
      query: (id) => `/games?user=${id}`,
      providesTags: ['Game']
    }),
    login: builder.mutation<AuthData, string>({
      query: (code) => `/auth/login?code=${code}`,
      invalidatesTags: ['Connected'],
    }),
    dummyLogin: builder.mutation<{}, string>({
      query: (name) => `/auth/dummy?name=${name}`,
      invalidatesTags: ['Connected']
    }),
    surrender: builder.mutation<{}, string>({
      query: (gameId) => `/games/surrender/${gameId}`,
      invalidatesTags: ['Game', 'User'],
    }),
    getUserCurrentGame: builder.query<{gameId?:string}, string>({
      query: (userId) => `/games/ongoingByUser/${userId}`
    }),
    postUser: builder.mutation<{}, User>({
      query: (user) => POST("/users", user)
    }),
    getConnectedChannels: builder.query<Channel[], void>({
      query: () => "/users/channels",
      providesTags: ['Channel']
    }),
    getAvailableChannels: builder.query<ChannelDesc[], string>({
      query: (search: string = "") => "/channels?search=" + search,
      providesTags: ['Channel'],
    }),
    createChannel: builder.mutation<{}, CreateChannelAction>({
      query: (channel) => POST("/channels", channel),
      invalidatesTags: ['Channel'],
    }),
    deleteChannel: builder.mutation<{}, string>({
      query: (channel) => DELETE("/channels", channel),
      invalidatesTags: ['Channel'],
    }),
    joinChannel: builder.mutation<{ id: string }, JoinChannelAction>({
      query: (channel) => POST("/channels/join", channel),
      invalidatesTags: ['Channel'],
    }),
    leaveChannel: builder.mutation<{}, string>({
      query: (id) => POST("/channels/leave", { id }),
      invalidatesTags: ['Channel'],
    }),
    updateChannel: builder.mutation<{}, Partial<ChannelUpdate>>({
        query: ({ id, ...channel }) => PUT(`/channels/${id}`, channel),
        invalidatesTags: (res, error, query) => ['Channel', { type: 'Channel', id: query.id }],
      }),
    getChannel: builder.query<DetailedChannel, string>({
      query: (id) => `/channels/${id}`,
      providesTags: (res, error, query) => [{ type: 'Channel', id: query } ],
    }),
    demote: builder.mutation<{}, { channel: string, user: string }>({
      query: ({ channel, user }) => POST(`/channels/${channel}/admin`, { userId: user, is_admin: false }),
      invalidatesTags: (res, error, { channel }) =>[{ type: 'Channel', id: channel }],
    }),
    promote: builder.mutation<{}, { channel: string, user: string }>({
      query: ({ channel, user }) => POST(`/channels/${channel}/admin`, { userId: user, is_admin: true }),
      invalidatesTags: (res, error, { channel }) =>[{ type: 'Channel', id: channel }],
    }),
    ban: builder.mutation<{}, {channel: string, time: Date, user: string}>({
      query: ({channel, time, user}) => POST(`/channels/${channel}/ban`,  {userId: user, timestamp: time}),
      invalidatesTags: (res, error, { channel }) => [{ type: 'Channel', id: channel }],
    }),
    unBan: builder.mutation<{}, {channel: string, user: string}>({
      query: ({channel, user}) => DELETE(`/channels/${channel}/ban`, {userId: user}),
      invalidatesTags: (res, error, { channel }) => [{ type: 'Channel', id: channel }],
    }),
    mute: builder.mutation<{}, {channel: string, time: Date, user: string}>({
      query: ({channel, time, user}) => POST(`/channels/${channel}/mute`,  {userId: user, timestamp: time}),
      invalidatesTags: (res, error, { channel }) => [{ type: 'Channel', id: channel }],
    }),
    unMute: builder.mutation<{}, {channel: string, user: string}>({
      query: ({channel, user}) => DELETE(`/channels/${channel}/mute`, {userId: user}),
      invalidatesTags: (res, error, { channel }) => [{ type: 'Channel', id: channel }],
    }),
    logout: builder.mutation<{}, void>({
      query: () => "/auth/logout",
      invalidatesTags: ['Connected']
    }),
    getFriends: builder.query<string[], void>({
      query: () => "/users/friend",
      providesTags: ['User']
    }),
    getBlocked: builder.query<string[], void>({
      query: () => "/users/block",
      providesTags: ['User']
    }),
    addFriend: builder.mutation<{}, string>({
      query: (id) => POST(
        "/users/friend", { id }),
      invalidatesTags: ['User']
    }),
    removeFriend: builder.mutation<{}, string>({
      query: (id) => DELETE("/users/friend", { id },),
      invalidatesTags: ['User']
    }),
    blockUser: builder.mutation<{}, string> ({
      query: (id) => POST("/users/block", { id },),
      invalidatesTags: ['User']
    }),
    unblockUser: builder.mutation<{}, string> ({
      query: (id) => DELETE("/users/block", { id },),
      invalidatesTags: ['User']
    }),
    changeUsername: builder.mutation<{}, { username: string, id: string }> ({
      query: ({ username, id }) => PUT("/users/me", { username },),
      invalidatesTags: (res, err, { username, id }) => [{ type: 'User', id }],
    }),
    changeAvatar: builder.mutation<{}, { file: string, id: string }> ({
      query: ({ file }) => {
        const data = new FormData();
        data.append('file', file);
        return POST("/users/me/avatar", data,);
      },
      invalidatesTags: (res, err, { id }) => [{ type: 'User', id }],
    }),
    switchTfa: builder.mutation<{}, void> ({
      query: () => DELETE("/auth/tfa", {}),
      invalidatesTags: ['User']
    }),
    getQRCode: builder.query<any, void> ({
      query: () => ({
        url: "/auth/tfa",
        responseHandler: (res) => res.blob().then(blob => URL.createObjectURL(blob))
      })
    }),
    activateTfa: builder.mutation<{}, string> ({
      query: (code) => POST("/auth/tfa", { code }),
      invalidatesTags: ['User']
    }),
    authTfa: builder.mutation<{}, string> ({
      query: (code) => POST("/auth/login", { code }),
      invalidatesTags: ['Connected']
    }),
    getLeaderboard: builder.query<User[], { }>({
      query: () => "/users/leaderboard",
      providesTags: ['Game'],
    }),
    getUserAchievements: builder.query<AchievementUnlockDTO[], string>({
      query: (id) => `/users/${id}/achievements`,
      providesTags: (res,err,id)=>[{ type:"UserTrophies", id }],
    }),
  }),
});

export const {
	useGetMeQuery,
	useGetConnectedQuery,
	useGetAllUsersQuery,
	useGetUserByIdQuery,
  useGetUserCurrentGameQuery,
  useGetAvatarQuery,
  useGetMatchHistoryQuery,

	useGetConnectedChannelsQuery,
  useGetChannelQuery,

	useGetFriendsQuery,
	useGetBlockedQuery,
	useGetLeaderboardQuery,

	useGetUserAchievementsQuery,
} = api;

export const {
  useLoginMutation,
  useDummyLoginMutation,

  useCreateChannelMutation,
  useJoinChannelMutation,
  useLeaveChannelMutation,
  useUpdateChannelMutation,
  useDemoteMutation,
  usePromoteMutation,
  useBanMutation,
  useUnBanMutation,
  useMuteMutation,
  useUnMuteMutation,

  useAddFriendMutation,
  useRemoveFriendMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useChangeUsernameMutation,
  useSurrenderMutation,
  useChangeAvatarMutation,

  useSwitchTfaMutation,
  useActivateTfaMutation,
  useAuthTfaMutation,
  useLogoutMutation,
} = api;

export const {
  useLazyGetQRCodeQuery,
  useLazyGetAvailableChannelsQuery,
} = api;
