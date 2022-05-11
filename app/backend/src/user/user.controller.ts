import { Get, Post, Put, Delete, Body, Param, UploadedFile, Controller, UsePipes, ValidationPipe, UseGuards, UseInterceptors, Request, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './update-user.dto';
import { UserService }from './user.service';
import { User } from './user.entity';
import { UserClass } from './user.class';
import { AchievementUnlockDTO } from 'src/dtos/AchievementUnlock.dto';
import { Category } from 'src/achievement/achievementList.interface';
import { GameClass } from 'src/game/game.class';
import {JwtGuard} from "../auth/guards";
import { FormatName } from 'src/utils';

@Controller('users')
export class UserController {
  constructor(
	  private readonly userService: UserService
	  ) {}

  @Get()
  @UseGuards(JwtGuard)
  async findAll(): Promise<Partial <User>[]> {
    return (await this.userService.findAllUsers()).map(elem => new UserClass(elem));
  }

  @Get('/leaderboard')
  @UseGuards(JwtGuard)
  async leaderboard(): Promise<Partial <User>[]> {
    return this.userService.leaderBoard();
  }

  @Get('/me/achievements')
  @UseGuards(JwtGuard)
  async findMeAllAchievements(@Request() req): Promise<AchievementUnlockDTO[]> {
	  return this.findAllAchievements(req.user.id);
  }

  @Get('/:id/achievements')
  @UseGuards(JwtGuard)
  async findAllAchievements(@Param('id') id: User["id"]): Promise<AchievementUnlockDTO[]> {
    const arr: Category[] = await this.userService.findAllAchievements(id);
    let ret: AchievementUnlockDTO[] = [];
    arr.forEach(elem => {
      elem.achievements.forEach((i, rank) => {
        ret.push({ id: elem.name, date: i.date ? i.date.toString() : null, level: i.level, progress: elem.counter, progress_max: i.goal });
      });
    });
    return ret;
  }

  @Post('/me/achievements')
  @UseGuards(JwtGuard)
  async setAchievement(@Request() req, @Body('id') achievement_id): Promise<void> {
	  return this.userService.incrementAchievementCounter(req.user.id, achievement_id);
  }

  @Get('/friend')
  @UseGuards(JwtGuard)
  async findMeFriends(@Request() req): Promise<User["id"][]> {
    return await this.userService.findFriendsByUserID(req.user.id);
  }

  @Post('/friend')
  @UseGuards(JwtGuard)
  async addFriend(@Request() req, @Body('id') friend_id: User["id"], @Body('username') friend_username: string): Promise<User> {
    if (friend_id)
      return this.userService.addFriendByID(req.user.id, friend_id);
    else if (friend_username)
      return this.userService.addFriendByName(req.user.id, friend_username);
    else
      throw new HttpException('no argument given', HttpStatus.BAD_REQUEST);
  }

  @Delete('/friend')
  @UseGuards(JwtGuard)
  async removeFriend(@Request() req, @Body('id') friend_id: User["id"], @Body('username') friend_username: string): Promise<User> {
    if (friend_id)
      return this.userService.removeFriendByID(req.user.id, friend_id);
    else if (friend_username)
      return this.userService.removeFriendByName(req.user.id, friend_username);
    else
      throw new HttpException('no argument given', HttpStatus.BAD_REQUEST);
  }

  @Get('/block')
  @UseGuards(JwtGuard)
  async findMeBlocked(@Request() req): Promise<User["id"][]> {
    return this.userService.findBlockedByUserID(req.user.id);
  }

  @Post('/block')
  @UseGuards(JwtGuard)
  async addBlocked(@Request() req, @Body('id') block_id: User["id"], @Body('username') block_username: string): Promise<User> {
    if (block_id)
      return this.userService.addBlockedByID(req.user.id, block_id);
    else if (block_username)
      return this.userService.addBlockedByName(req.user.id, block_username);
    else
      throw new HttpException('no argument given', HttpStatus.BAD_REQUEST);
  }

  @Delete('/block')
  @UseGuards(JwtGuard)
  async removeBlocked(@Request() req, @Body('id') block_id: User["id"], @Body('username') block_username: string): Promise<User> {
    if (block_id)
      return this.userService.removeBlockedByID(req.user.id, block_id);
    else if (block_username)
      return this.userService.removeBlockedByName(req.user.id, block_username);
    else
      throw new HttpException('no argument given', HttpStatus.BAD_REQUEST);
  }

  @Get('/me')
  @UseGuards(JwtGuard)
  async findMe(@Request() req): Promise<Partial <User>> {
	  const { ftID, twoFactorAuthSecret, version, created_at, updated_at, achievementList, ... user } = await this.userService.findUserById(req.user.id);
	  return user;
  }

  @Get('/me/game-history')
  @UseGuards(JwtGuard)
  async findMeGameHistory(@Request() req): Promise<any> {
    return (await this.userService.findGamesByUserID(req.user.id)).map(elem => new GameClass(elem)).sort((game_1, game_2) => {
      if (game_1.ended > game_2.ended)
        return -1;
      else
        return 1;
    }).slice(0, 20);
  }

  @Put('/me')
  @UseGuards(JwtGuard)
  @UsePipes(new ValidationPipe())
  async updateUsername(@Request() req, @Body() query: UpdateUserDto) {
    let user: User = await this.userService.findUserById(req.user.id);
    if (!user)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (!query.username || !FormatName(query.username))
      throw new HttpException("Invalid username format", HttpStatus.BAD_REQUEST);
    user.username = FormatName(query.username);
    return await this.userService.updateUser(user.id, user);
  }

  @Post('/me/avatar')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(@Request() req, @UploadedFile() file: Express.Multer.File): Promise<any> {
    let user: User = await this.userService.findUserById(req.user.id);
    if (!user)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (!file)
      throw new HttpException("No avatar given", HttpStatus.BAD_REQUEST);
    const regex = new RegExp(/([a-zA-Z0-9\s_\\.\-\(\):])+(.jpg|.jpeg|.png|.gif)$/i)
    if (!regex.test(file.originalname))
      throw new HttpException('Invalid file format', HttpStatus.BAD_REQUEST);
    await this.userService.addAvatar(user.id, file.buffer);
    return { success: true };
  }

  @Get('/channels')
  @UseGuards(JwtGuard)
  @UsePipes(new ValidationPipe())
  async findMeChats(@Request() req): Promise<any> {
    const chats = await this.userService.findChatsByUserID(req.user.id);
    return chats.map((elem) => ({
        id: elem.id,
        name: elem.name,
        owner: elem.owner,
        owned: elem.owner === req.user.id,
        admin: elem.admins.indexOf(req.user.id) !== -1,
        admins: elem.admins,
        isPrivate: elem.isPrivate
      }));
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Request() req, @Param('id') id: User["id"]): Promise<Partial <User>> {
    if (req.user.id === id)
      return this.findMe(req);
    else {
      const user = await this.userService.findUserById(id);
      return new UserClass(user);
    }
  }

}
