import { WebSocketGateway, WebSocketServer, WsResponse, WsException, ConnectedSocket, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Request, UsePipes, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Server, Socket } from 'socket.io';
import { Chat } from './chat.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { ChatService } from './chat.service';
import {Message, MessageDto} from './message.dto';
import { DmDto } from './dm.dto';
import { Status } from 'src/enums/status.enum';

import {Console, IdContext} from 'src/Logger';

@WebSocketGateway({ namespace: 'chat', path: "/chat", cors: { origin:true, credentials:true }})
//@UseGuards(WsGuard)
export class ChatGateway implements OnGatewayConnection {

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private jwt: JwtService
  ) {
    this.userService.onStatusChange = (userId) => this.server.emit("update_user", userId);
  }

  @WebSocketServer() server: Server;

  connected_map: Map<Socket, User["id"]> = new Map<Socket, User["id"]>();

  async handleConnection(client): Promise<WsResponse<unknown>> {
    try {
      const token = client.handshake.headers.cookie.split('=')[1];
      const jwtoken = this.jwt.verify(token);
      let user = await this.userService.findUserById(jwtoken.id);
      if (!user)
        throw new WsException('Could not find user');
      this.connected_map.set(client, user.id);
      Console.log(`User ${user.username} connected on chat socket with client ${client.id}.`);
      for (let i of await this.chatService.findAllChatsWithUser(user.id)) {
        client.join(i.id);
        Console.log(`user ${user.username} on client ${client.id} joined ${i.id}`);
      }
      if (!user.status) {
        await this.userService.setStatus(user.id, Status.Online);
      }
    } catch(e) {
      Console.warn(`Couldn't authenticate client ${client.id} on chat socket (${e.message})`);
      client.disconnect();
      return ;
    }
  }

  async handleDisconnect(client) {
    Console.log(`Client ${client.id} disconnected from chat socket`);
    client.disconnect();
    try {
      let user = await this.userService.findUserById(this.connected_map.get(client));
      this.connected_map.delete(client);
      for (let [key, value] of this.connected_map){
        if (value === user.id) // check for additionnal connected clients
          return ;
      }
      await this.userService.setStatus(user.id, Status.Offline);
    } catch(e) {
      Console.log(e.message);
    }
  }

  async joinChat(user_id: User["id"], chat_id: Chat["id"]): Promise<any> {
    const user = await this.userService.findUserById(user_id);
    if (!user)
      throw new WsException('User not found');
    let chat: Chat;
    try {
      chat = await this.chatService.findChatById(chat_id);
    } catch (e) {
      return new WsException('chat not found');
    }
    this.connected_map.forEach((value, key) => {
      if (value === user.id) {
        key.join(chat.id);
        Console.log(`user ${user.username} on client ${key.id} joined ${chat.id}`);
      }
    });
    this.server.to(chat.id).emit('joined', { channel: chat.id, user });
    return chat.id;
  }

  async leaveChat(user_id: User["id"], chat_id: Chat["id"]): Promise<void> {
    const user = await this.userService.findUserById(user_id);
    if (!user)
      throw new WsException('User not found');
    this.connected_map.forEach((value, key) => {
      if (value === user.id)
        key.leave(chat_id);
    });
    this.server.to(chat_id).emit('leave', { channel: chat_id, user });
  }

  kick(channel: Chat["id"], user?: User["id"]) {
    if (!user)
      this.server.to(channel).emit('kicked', { channel });
    else
      for (let [sock, e] of this.connected_map.entries()) {
        if (e === user)
          this.server.to(sock.id).emit("kicked", { channel });
      }
  }

  deleteChat(chat_id: Chat["id"]) {
    this.server.in(chat_id).socketsLeave(chat_id);
  }

  sendUpdateSignal(chat_id: Chat["id"]): void {
    this.server.to(chat_id).emit("update", { channel: chat_id });
  }

  @SubscribeMessage('send_dm')
  @UsePipes(new ValidationPipe())
  async listenForDm(@ConnectedSocket() client: Socket, @MessageBody() data: DmDto): Promise<any> {
    const sender = this.connected_map.get(client);
    const receiver = await this.userService.findUserById(data.user);
    if (!receiver)
      return { err: true };
    if (receiver.blocked.indexOf(sender) != -1)
      return { err: true };
    let message = { sender: sender, content: data.message.trim(), createdAt: new Date().toISOString() } as Message;
    Console.ctx_log(new IdContext(sender), message);
    for (let i of this.connected_map.keys()) {
      if (this.connected_map.get(i) === receiver.id)
        this.server.to(i.id).emit('send', message);
    }
    return message;
  }

  @SubscribeMessage('send_channel')
  @UsePipes(new ValidationPipe())
  async listenForMessages(@ConnectedSocket() client: Socket, @MessageBody() data: MessageDto): Promise<any> {
    const user = this.connected_map.get(client);
    const sender = await this.userService.findUserById(user);
    try {
      if (!sender)
        throw new WsException('Internal server error');
      const chat = await this.chatService.findChatById(data.channel);
      if (!chat)
        throw new WsException('chat not found');
      if (!chat.users.find(elem => elem.id === sender.id))
        throw new WsException("You're not a member of this channel");
      for (let i: number = 0; i < chat.muteList.length; i++) {
        if (sender.id === chat.muteList[i].user && new Date() < chat.muteList[i].timestamp)
          return new WsException("You're mute on this channel");
      }
    } catch (e) {
      Console.err(e.message);
      return new WsException(e.message);
    }
    const msg = { channel: data.channel, sender: sender.id, content: data.message.trim(), createdAt: new Date().toISOString() };
    Console.ctx_log(new IdContext(user), msg);
    this.server.to(data.channel).emit('send', msg as Message);
    this.userService.incrementAchievementCounter(sender.id, 'talk');
  }

}
