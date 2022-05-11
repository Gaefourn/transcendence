import {Injectable, HttpException, HttpStatus, UnauthorizedException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Like, Repository} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { WsException } from '@nestjs/websockets';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Chat } from './chat.entity';
import { Mute } from './mute.entity';
import { Ban } from './ban.entity';
import { CreateChatDto } from './create-chat.dto';
import { UpdateChatDto } from './update-chat.dto';

const JOIN_CHAT_LIMIT = 50;
const CREATE_CHAT_LIMIT = 25;
const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Mute)
    private muteRepository: Repository<Mute>,
    @InjectRepository(Ban)
    private banRepository: Repository<Ban>,
    private userService: UserService,
  ) {}

  async findAllChats(): Promise<Chat[]> {
    return this.chatRepository.find();
  }

  async findAllChatsWithRelation(): Promise<Chat[]> {
    return this.chatRepository.find({ relations: [ 'users', 'muteList', 'banList']});
  }

  async findAllChatsWithUser(user_id: User["id"]): Promise<Chat[]> {
    let arr = await this.chatRepository.find({ relations: ['users'] });
    const user = await this.userService.findUserById(user_id);
    return arr.filter((elem) => {
      for (let i of elem.users) {
        if (i.id === user.id)
          return true;
      }
      return false;
    });
  }

  async findAllPublicChats(search: string = ""): Promise<{  id: Chat['id'], name: string, protected: boolean }[]> {
    const res = (await this.chatRepository.createQueryBuilder('chat')
      .where('chat."isPrivate" = false')
      .andWhere('chat.name like :name', { name: `%${search}%` })
      .select('chat.id as id, chat.name as name, chat.password as password')
      .addSelect('COUNT(users.id) as userCount')
      .leftJoin('chat.users', 'users')
      .groupBy('chat.id')
      .orderBy('userCount', 'DESC')
      .addOrderBy('chat.name', 'ASC')
      .limit(50)
      .execute());
    console.log(res);
    return res.map(({ usercount, password, ...chat }) => ({ ...chat, protected: !!password }));
  }

  async findChatById(id: Chat["id"]): Promise<Chat> {
      if (!regex.test(id)) {
        throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
    }
    const chat = await this.chatRepository.findOne({where: { id: id },  relations: [ 'users', 'muteList', 'banList' ]});
    if (!chat)
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    return chat;
  }

  async findChatByName(chatname: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({where: { name: chatname },  relations: [ 'users', 'muteList', 'banList' ]});
    if (!chat)
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    return chat;
  }

  async createChat(user_id: User["id"], chat: CreateChatDto): Promise<Chat> {
    if (await this.chatRepository.findOne({ where: { name: chat.name }, relations: [ '_owner' ] }))
      throw new HttpException(`Chatname '${chat.name}' already in use`, HttpStatus.BAD_REQUEST);
    let owner = await this.userService.findUserByIdRelations(user_id);
    if (!owner)
      throw new HttpException('Owner id is unkwnown', HttpStatus.BAD_REQUEST);
	if (owner.owned_chats === undefined)
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    if (owner.owned_chats.length > CREATE_CHAT_LIMIT)
      throw new HttpException('Already created too many channels', HttpStatus.FORBIDDEN);
    chat._owner = owner;
    await this.userService.incrementAchievementCounter(user_id, "channelCreate");
    return this.chatRepository.save(this.chatRepository.create(chat));
  }

  async updateChat(id: Chat["id"], chat: UpdateChatDto): Promise<Chat> {
    const old = await this.chatRepository.findOne(id);
    if (!old) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }
    if (chat.name && old.name !== chat.name && await this.chatRepository.findOne({ name: chat.name })) {
      throw new HttpException(`Chatname '${chat.name}' already in use`, HttpStatus.BAD_REQUEST);
    }
    else if (chat.name !== undefined && !chat.name)
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    else if (chat.name)
      old.name = chat.name;
    if (chat.password !== undefined)
      old.password = chat.password;
    if (chat.isPrivate !== undefined)
      old.isPrivate = chat.isPrivate;
    await this.chatRepository.save(old);
    return await this.chatRepository.findOne(id);
  }

  async deleteChat(id: Chat["id"]): Promise<void> {
    if (!regex.test(id)) {
      throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
    }
    await this.chatRepository.delete(id);
  }

  async joinChatById(user_id: User["id"], chat_id: Chat["id"], password: string): Promise<Chat> {
    if (chat_id === undefined || user_id === undefined)
      throw new HttpException('Undefined parameters', HttpStatus.BAD_REQUEST);
    let chat = await this.chatRepository.findOne(chat_id, { relations: [ 'users', 'banList' ] });
    const user = await this.userService.findUserByIdRelations(user_id);
    return this.joinChat(user, chat, password);
  }

  async joinChatByName(user_id: User["id"], chatname: string, password: string): Promise<Chat> {
    if (chatname === undefined || user_id === undefined)
      throw new HttpException('Undefined parameters', HttpStatus.BAD_REQUEST);
    let chat = await this.chatRepository.findOne({ where: {name: chatname}, relations: [ 'users', 'banList' ] });
    const user = await this.userService.findUserByIdRelations(user_id);
    return this.joinChat(user, chat, password);
  }

  async joinChat(user: User, chat: Chat, password: string): Promise<Chat> {
    if (!chat) {
      throw new HttpException('Wrong channel or password', HttpStatus.BAD_REQUEST);
    }
    if (!user) {
      throw new HttpException('Unknown user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (user.chats === undefined)
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
	if (user.chats.length > JOIN_CHAT_LIMIT)
      throw new HttpException('Already in too many channels', HttpStatus.FORBIDDEN);
    if (chat.users.find(elem => elem.id === user.id ))
      throw new HttpException('User already in chat', HttpStatus.BAD_REQUEST);
    if (chat.password && (!password || !(await bcrypt.compare(password, chat.password))))
      throw new HttpException('Wrong channel or password', HttpStatus.BAD_REQUEST);
    if (!chat.password && password)
      throw new HttpException('Wrong channel or password', HttpStatus.BAD_REQUEST);
    if (chat.banList.find(elem => elem.user === user.id))
      throw new UnauthorizedException("You are banned from this channel");
    chat.users.push(user);
    await this.chatRepository.save(chat);
    const updatedChat = await this.chatRepository.findOne(chat.id);
    if (updatedChat) {
      return updatedChat;
    }
    throw new HttpException('could not add user to chat', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async leaveChat(user_id: User["id"], chat_id: Chat["id"]): Promise<any> {
    if (chat_id === undefined || user_id === undefined)
      throw new HttpException('Undefined parameters', HttpStatus.INTERNAL_SERVER_ERROR);
    let chat = await this.chatRepository.findOne({ where: { id: chat_id }, relations: ['users'] });
    if (!chat)
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    const i = chat.users.findIndex(elem => elem.id === user_id);
    if (i === -1)
      throw new HttpException('User not in chat', HttpStatus.BAD_REQUEST);
    chat.users.splice(i, 1);
    await this.chatRepository.save(chat);
    const updatedChat = await this.chatRepository.findOne(chat_id);
    if (!updatedChat)
      throw new HttpException('could not update chat', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async addMute(user_id: User["id"], chat_id: Chat["id"], timestamp: Date): Promise<any[]> {
    let chat = await this.chatRepository.findOne(chat_id, { relations: ['users', 'muteList', 'muteList._user'] });
    const user = await this.userService.findUserById(user_id);
    if (!chat)
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    if (!user)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (!chat.users.find(elem => elem.id === user.id))
      throw new HttpException('User not in chat', HttpStatus.BAD_REQUEST);
    if (chat.admins.indexOf(user_id) !== -1)
      throw new HttpException('Cannot mute admin', HttpStatus.BAD_REQUEST);
	let mute = chat.muteList.find(e => e.user === user_id);
    if (mute) {
      mute.timestamp = timestamp;
      await this.muteRepository.save(mute);
    }
    else {
      const new_mute = await this.muteRepository.create({ _user: user, timestamp: timestamp });
      await this.muteRepository.save(new_mute);
      chat.muteList.push(new_mute);
    }
    await this.chatRepository.save(chat);
    const updatedChat = await this.chatRepository.findOne(chat_id, {relations: ['muteList']});
    if (!updatedChat)
      throw new HttpException('could not update chat', HttpStatus.INTERNAL_SERVER_ERROR);
    return updatedChat.muteList;
  }

  async removeMute(user_id: User["id"], chat_id: Chat["id"]): Promise<any[]> {
    let chat = await this.chatRepository.findOne(chat_id, { relations: [ 'muteList'] });
    const user = await this.userService.findUserById(user_id);
    if (!chat)
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    await this.chatRepository.save(chat.muteList.filter(e => e.user !== user_id));
    const updatedChat = await this.chatRepository.findOne(chat_id, {relations: ['muteList']});
    if (!updatedChat)
      throw new HttpException('could not update chat', HttpStatus.INTERNAL_SERVER_ERROR);
    return updatedChat.muteList;
  }

  async addBan(user_id: User["id"], chat_id: Chat["id"], timestamp: Date): Promise<any[]> {
    let chat: Chat = await this.chatRepository.findOne(chat_id, { relations: [ 'users', 'banList', 'banList._user' ] });
    const user: User = await this.userService.findUserById(user_id);
    if (!chat)
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    if (!user)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (chat.admins.indexOf(user_id) !== -1)
      throw new HttpException('Cannot ban admin', HttpStatus.BAD_REQUEST);
    let ban = chat.banList.find(e => e.user === user.id);
    if (ban) {
      ban.timestamp = timestamp;
      await this.banRepository.save(ban);
    }
    else {
      let i = chat.users.findIndex(elem => elem.id === user_id);
      if (i === -1)
        throw new HttpException('User not in chat', HttpStatus.BAD_REQUEST);
      const new_ban = await this.banRepository.create({ _user: user, timestamp: timestamp });
      await this.banRepository.save(new_ban);
      chat.banList.push(new_ban);
      chat.users.splice(i, 1);
      await this.userService.incrementAchievementCounter(user_id, "banned");
    }
    await this.chatRepository.save(chat);
    const updatedChat = await this.chatRepository.findOne(chat_id, {relations: [ 'banList' ]});
    if (!updatedChat)
      throw new HttpException('could not update chat', HttpStatus.INTERNAL_SERVER_ERROR);
    return updatedChat.banList;
  }

  async removeBan(user_id: User["id"], chat_id: Chat["id"]): Promise<any[]> {
    let chat = await this.chatRepository.findOne(chat_id, { relations: ['banList'] });
    if (!chat)
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    chat.banList = chat.banList.filter(e => e.user !== user_id);
    await this.chatRepository.save(chat);
    const updatedChat = await this.chatRepository.findOne(chat_id, {relations: ['banList']});
    if (!updatedChat)
      throw new HttpException('could not update chat', HttpStatus.INTERNAL_SERVER_ERROR);
    return updatedChat.banList;
  }

  async setAdmin(user_id: User["id"], chat_id: Chat["id"], is_admin: boolean): Promise<User["id"][]> {
    let chat = await this.chatRepository.findOne(chat_id, { relations: ['users']});
    const user = await this.userService.findUserById(user_id);
    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!chat.users.find(elem => elem.id === user.id)) {
      throw new HttpException('User not in chat', HttpStatus.BAD_REQUEST);
    }
    if (is_admin && chat.admins.indexOf(user_id) === -1) {
      chat.admins.push(user_id);
      if (chat.owner !== user.id)
        await this.userService.incrementAchievementCounter(user_id, "channelAdmin");
    }
    else if (!is_admin && chat.admins.indexOf(user_id) !== -1)
      chat.admins.splice(chat.admins.indexOf(user_id), 1);
    await this.chatRepository.update(chat.id, { admins: chat.admins });
    const updatedChat = await this.chatRepository.findOne(chat_id);
    if (!updatedChat) {
      throw new HttpException('could not update chat', 500);
    }
    return chat.admins;
  }

}
