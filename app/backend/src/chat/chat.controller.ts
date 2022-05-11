import { Controller, Get, Post, Put, Delete, Param, Query, Request, Body, UsePipes, UseGuards, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Chat } from './chat.entity';
import { User } from '../user/user.entity';
import { UserClass } from '../user/user.class';
import { UserService } from '../user/user.service';
import { ChatDao } from './chat.dao';
import { CreateChatDto } from './create-chat.dto';
import { UpdateChatDto } from './update-chat.dto';
import {JwtGuard} from "../auth/guards";
import { FormatName } from 'src/utils';

@Controller('/channels')
export class ChatController {

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private chatGateway: ChatGateway
  ) {}

  @Get()
  @UseGuards(JwtGuard)
  async listChat(@Request() req, @Query('search') search: string): Promise<ChatDao[]> {
    return this.chatService.findAllPublicChats(search);
  }

  @Get('/:id')
  @UseGuards(JwtGuard)
  async getChat(@Request() req, @Param('id') id: Chat["id"]): Promise<any> {
    const { password, created_at, updated_at, version, ... chat } = await this.chatService.findChatById(id);
    return {
      id: chat.id,
      name: chat.name,
      owner: chat.owner,
      owned: chat.owner === req.user.id,
      admin: (chat.admins.indexOf(req.user.id) !== -1),
      admins: chat.admins,
      isPrivate: chat.isPrivate,
      users: chat.users.map(elem => elem.id),
      muteList: (chat.admins.indexOf(req.user.id) !== -1) ? chat.muteList.map(elem => { return {user: elem.user, until: elem.timestamp}}) : [],
      banList: (chat.admins.indexOf(req.user.id) !== -1) ? chat.banList.map(elem => { return {user: elem.user, until: elem.timestamp}}) : [],
      muted: !!chat.muteList.find(e => e.user === req.user.id),
    }
  }

  @Post()
  @UseGuards(JwtGuard)
  @UsePipes(new ValidationPipe({ transform: true}))
  async createChat(@Request() req, @Body() data: CreateChatDto): Promise<any> {
    data.name = FormatName(data.name);
    if (!data.name)
      throw new HttpException('Invalid name format', 400);
    const chat = await this.chatService.createChat(req.user.id, data);
    try {
      await this.chatService.joinChatById(req.user.id, chat.id, data.password);
      await this.chatService.setAdmin(req.user.id, chat.id, true);
      await this.chatGateway.joinChat(req.user.id, chat.id);
    } catch(e) {
      await this.chatService.deleteChat(chat.id);
      throw new HttpException(e.message, e.status);
    }
    return { success: true };
  }

  @Post('/join')
  @UseGuards(JwtGuard)
  async joinChat(@Request() req, @Body('id') chat_id: Chat["id"], @Body('name') chat_name: string, @Body('password') password: string): Promise<any> {
    if (chat_id === undefined && chat_name === undefined)
      throw new HttpException('Nor id or name has been provided', HttpStatus.BAD_REQUEST);
    let chat: Chat;
    if (chat_id !== undefined)
      chat = await this.chatService.findChatById(chat_id);
    else if (chat_name !== undefined)
      chat = await this.chatService.findChatByName(chat_name);
    await this.chatService.joinChatById(req.user.id, chat.id, password);
    await this.chatGateway.joinChat(req.user.id, chat.id);
    this.chatGateway.sendUpdateSignal(chat.id);
    return { success: true, id: chat.id };
  }

  @Post('/leave')
  @UseGuards(JwtGuard)
  async leaveChat(@Request() req, @Body('id') chat_id: Chat["id"]): Promise<any> {
    const user = await this.userService.findUserById(req.user.id);
    const chat = await this.chatService.findChatById(chat_id);
    if (!user || !chat)
      throw new HttpException('Not found', 404);
    if (chat.owner === user.id) {
      this.chatGateway.kick(chat.id);
      this.chatGateway.deleteChat(chat_id);
      await this.chatService.deleteChat(chat_id);
    }
    else {
      await this.chatService.leaveChat(req.user.id, chat_id);
      await this.chatGateway.leaveChat(req.user.id, chat_id);
      this.chatGateway.sendUpdateSignal(chat.id);
    }
    return { success: true };
  }

  @Put('/:id')
  @UseGuards(JwtGuard)
  @UsePipes(new ValidationPipe())
  async updateChat(@Request() req, @Param('id') chat_id: Chat["id"], @Body() updated_chat: UpdateChatDto): Promise<any> {
    const user = await this.userService.findUserById(req.user.id);
    const chat = await this.chatService.findChatById(chat_id);
    if (!user || !chat)
      throw new HttpException('Not found', 404);
    if (updated_chat.name) {
      updated_chat.name = FormatName(updated_chat.name);
      if (!updated_chat.name)
        throw new HttpException('Invalid  name format', 400);
    }
    for (let i of chat.admins) {
      if (i === user.id) {
        await this.chatService.updateChat(chat_id, updated_chat);
        return { success: true };
      }
    }
    throw new HttpException('You must be admin to update', 401);
  }

  @Post('/:id/mute')
  @UseGuards(JwtGuard)
  async muteUser(@Request() req, @Param('id') chat_id: Chat["id"], @Body('userId') user_id: User["id"], @Body('timestamp') timestamp: Date) : Promise<any> {
    const user = await this.userService.findUserById(req.user.id);
    const chat = await this.chatService.findChatById(chat_id);
    if (!user || !chat)
      throw new HttpException('Not found', 404);
    for (let i of chat.admins) {
      if (i === user.id) {
        await this.chatService.addMute(user_id, chat_id, timestamp);
        this.chatGateway.sendUpdateSignal(chat.id);
        return { success: true };
      }
    }
    throw new HttpException('You must be admin to mute someone', 401);
  }

  @Delete('/:id/mute')
  @UseGuards(JwtGuard)
  async unmuteUser(@Request() req, @Param('id') chat_id: Chat["id"], @Body('userId') user_id: User["id"]) : Promise<any> {
    const user = await this.userService.findUserById(req.user.id);
    const chat = await this.chatService.findChatById(chat_id);
    if (!user)
      throw new HttpException('Unknown user', HttpStatus.NOT_FOUND);
    if (!chat)
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    for (let i of chat.admins) {
      if (i === user.id) {
        await this.chatService.removeMute(user_id, chat_id);
        this.chatGateway.sendUpdateSignal(chat.id);
        return { success: true };
      }
    }
    throw new HttpException('You must be admin to unmute someone', 401);
  }

  @Post('/:id/ban')
  @UseGuards(JwtGuard)
  async banUser(@Request() req, @Param('id') chat_id: Chat["id"], @Body('userId') user_id: User["id"], @Body('timestamp') timestamp: Date) : Promise<any> {
    const user = await this.userService.findUserById(req.user.id);
    const chat = await this.chatService.findChatById(chat_id);
    if (!user || !chat)
      throw new HttpException('Not found', 400);
    for (let i of chat.admins) {
      if (i === user.id) {
        await this.chatService.addBan(user_id, chat_id, timestamp);
        this.chatGateway.sendUpdateSignal(chat.id);
        await this.chatGateway.leaveChat(user_id, chat_id);
        this.chatGateway.kick(chat.id, user_id);
        return { success: true };
      }
    }
    throw new HttpException('You must be admin to ban someone', 401);
  }

  @Delete('/:id/ban')
  @UseGuards(JwtGuard)
  async unbanUser(@Request() req, @Param('id') chat_id: Chat["id"], @Body('userId') user_id: User["id"]) : Promise<any> {
    const user = await this.userService.findUserById(req.user.id);
    const chat = await this.chatService.findChatById(chat_id);
    if (!user || !chat)
      throw new HttpException('Not found', 400);
    for (let i of chat.admins) {
      if (i === user.id) {
        await this.chatService.removeBan(user_id, chat.id);
        this.chatGateway.sendUpdateSignal(chat.id);
        return { success: true };
      }
    }
  }

  @Post('/:id/admin')
  @UseGuards(JwtGuard)
  async addAdmin(@Request() req, @Param('id') chat_id: Chat["id"], @Body('userId') user_id: User["id"], @Body('is_admin') is_admin: boolean): Promise<any> {
    const user = await this.userService.findUserById(req.user.id);
    const chat = await this.chatService.findChatById(chat_id);
    if (!user || !chat)
      throw new HttpException('Not found', 400);
    if (chat.owner !== user.id)
      throw new HttpException('You must be owner to set someone as admin', 401);
    await this.chatService.setAdmin(user_id, chat_id, is_admin);
    this.chatGateway.sendUpdateSignal(chat.id);
    return { success: true };
  }

}
