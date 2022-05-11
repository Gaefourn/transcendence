import socketIOClient from "socket.io-client";
import {createSlice, Middleware, PayloadAction} from '@reduxjs/toolkit';
import {Message} from 'store/types/channel';
import {RootState} from 'store/index';
import {User} from 'store/types/user';
import {api} from 'store/api';
import * as util from 'util';

type socket = ReturnType<typeof socketIOClient>

const HOST = process.env.REACT_APP_HOST!;
const NAMESPACE = "/chat";

export default class ChatSocket
{
  public io: socket = socketIOClient(HOST + NAMESPACE, { path: NAMESPACE, withCredentials:true });
}

export enum MessageKind {
  Channel,
  Dm
}

type MessageData = {
  room: string,
  kind: MessageKind,
  message: string
}

export const chatSlice = createSlice({
  name: "chat",
  initialState: {
    connected: false,
    connecting: false,
    messages: {} as Record<string, Message[]>,
    conversations: [] as string[]
  },
  reducers: {
    connect(state, action: PayloadAction<void>) {
      if (!state.connecting && !state.connected)
      {
        state.connecting = true;
        state.messages = { };
      }
    },
    connected(state, action: PayloadAction<boolean>) {
      state.connecting = false;
      state.connected = action.payload;
    },
    disconnect(state) {
      state.connected = false;
    },
    leave(state, action: PayloadAction<string>) {
      state.messages[action.payload] = [];
    },
    receive(state, action: PayloadAction<{room: string, message: Message, kind: MessageKind }>) {
      const { room, message } = action.payload;
      if (!state.messages[room])
        state.messages[room] = [message];
      else
        state.messages[room] = [...state.messages[room], message].slice(-100);
    },
    message(state, action: PayloadAction<MessageData>) {},
    newDM(state, action: PayloadAction<string>) {
      if (state.conversations.indexOf(action.payload) === -1)
        state.conversations.push(action.payload);
    },
    closeDM(state, action: PayloadAction<string>) {
      state.conversations = state.conversations.filter(e => e !== action.payload);
    },
  }
});

export const { message, leave, receive, connect, connected, disconnect, newDM } = chatSlice.actions;

export type ChannelData = { channel: string };

export type SendData = {
  channel?: string;
  sender?: string;
  message: string;
}

export type JoinData = ChannelData & {
  user: User;
}

export const middleware: Middleware<{}, RootState> & { socket?: ChatSocket } = store => next => action => {
  const state = store.getState();

  if (connect.match(action)) {
    if (state.chat.connecting || state.chat.connected)
      return next(action);
    const socket = new ChatSocket();

    socket.io.onAny((evt, data) => {
      // console.log(new Date() + "[" + evt + "]: " + JSON.stringify(data));
    })

    socket.io.on("connect", () => store.dispatch(connected(true)));
    socket.io.on("disconnect", () => store.dispatch(connected(false)));

    socket.io.on('update', ({ channel }: ChannelData) => {
      store.dispatch(api.util.invalidateTags([ { type: 'Channel', id: channel }, { type: 'Channel' }]));
    });
    socket.io.on("send", ({ channel, ...data }: Message & { channel?: string }) => {
      const message = {
        room: (channel || data.sender)!,
        message: data,
        kind: channel ? MessageKind.Channel : MessageKind.Dm
      };
      store.dispatch(receive(message));
      if (message.kind === MessageKind.Dm)
        store.dispatch(newDM(message.room));
    });
    socket.io.on("joined", ({ channel, user }: JoinData) => {
      store.dispatch(receive({
        room: channel,
        message: { sender: '', createdAt: new Date().toISOString(), content: `Welcome aboard, ${user.username} !` },
        kind: MessageKind.Channel
      }));
    });
    socket.io.on('kicked', ({ channel }: ChannelData) => {
      store.dispatch(api.util.invalidateTags(['Channel']));
      store.dispatch(leave(channel));
    });

    socket.io.on("update_user", (id: string) => {
      store.dispatch(api.util.invalidateTags([{ type: 'User', id }]));
    });
    socket.io.on("leave", ({channel, user}: JoinData) => {
      store.dispatch(receive({
        room: channel,
        message: { sender: '', createdAt: new Date().toISOString(), content: `${user.username} has left !` },
        kind: MessageKind.Channel
      }));
    });
    middleware.socket = socket;
  }
  if (message.match(action)) {
    if (action.payload.kind === MessageKind.Dm) {
      middleware.socket?.io.emit('send_dm', { user: action.payload.room, message: action.payload.message }, (res: { err?: boolean } | Message) => {
          store.dispatch(receive({
            room: action.payload.room,
            message: 'err' in res ? { sender: '', createdAt: new Date().toISOString(), content: "Failed to deliver message." } : res as Message,
            kind: MessageKind.Dm
          }));
      });
    }
    else
      middleware.socket?.io.emit('send_channel', { channel: action.payload.room, message: action.payload.message });
  }
  if (disconnect.match(action) && state.chat.connected) {
    middleware.socket?.io.removeAllListeners();
    middleware.socket?.io.disconnect();
  }
  next(action);
};

export const useChatSocket = () => middleware.socket;
