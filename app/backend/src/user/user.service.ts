import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserClass } from './user.class';
import { DatabaseFileService } from './databaseFile.service';
import { Achievement, Category } from '../achievement/achievementList.interface';
import { Game } from '../game/game.entity';
import { Chat } from '../chat/chat.entity';
import { UpdateUserDto } from './update-user.dto';
import { Status } from 'src/enums/status.enum';
import { EloStatus } from 'src/enums/eloStatus.enum';

const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
type userEventCallback = (userId: User["id"]) => any;
type trophyCallback = (userId:User["id"], trophyId:string, trophyLvl:number) => any

@Injectable()
export class UserService {
	/**
	 * Event that is fired whenever a user's status is changed;
	 */
	public onStatusChange:userEventCallback;
	public onTrophyUnlocked:trophyCallback;

	constructor (
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private readonly databaseFileService: DatabaseFileService,
	) {}

	async findAllUsers(): Promise<User[]> {
		return this.userRepository.find();
	}

	async leaderBoard(): Promise<any> {
		return this.userRepository.find({ order: { rating: 'DESC' }, take: 100 });
	}

	async findAllAchievements(user_id: User["id"]): Promise<Category[]> {
		if (!regex.test(user_id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const user = await this.userRepository.findOne(user_id);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user.achievementList;
	}

	async findUserById(id: User["id"]): Promise<User | null> {
		if (!regex.test(id)) {
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		}

		const user = await this.userRepository.findOne(id);
		return user || null;
	}

	async findUserByIdRelations(id: User["id"]): Promise<User | null> {
		if (!regex.test(id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const user = await this.userRepository.findOne(id, {relations: ['owned_chats', 'chats']});
		return user || null;
	}

	async findUserByFtID(ftID: string): Promise<User | null> {
		const user = await this.userRepository.findOne({ ftID: ftID });
		return user || null;
	}

	async findUserByName(username: string): Promise<User | null> {
		const user = await this.userRepository.findOne({ username: username });
		return user || null;
	}

	async findGamesByFtID(ftID: string): Promise<Game[]> {
		const user: User = await this.userRepository.findOne({ where: { ftID: ftID }, relations: ['winned_games', 'lost_games'] });
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user.winned_games.concat(user.lost_games);
	}

	async findGamesByUserID(user_id: User["id"]): Promise<Game[]> {
		const user: User = await this.userRepository.findOne({ where: { id: user_id }, relations: ['winned_games', 'lost_games'] });
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user.winned_games.concat(user.lost_games);
	}

	async findBlockedByUserID(user_id: User["id"]): Promise<User["id"][]> {
		const user: User = await this.userRepository.findOne(user_id);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user.blocked;
	}

	async findFriendsByUserID(user_id: User["id"]): Promise<User["id"][]> {
		const user: User = await this.userRepository.findOne(user_id);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user.friends;
	}

	async findChatsByFtID(ftID: string): Promise<Chat[]> {
		const user: User = await this.userRepository.findOne({ where: { ftID: ftID }, relations: ['chats'] });
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user.chats;
	}

	async findChatsByUserID(user_id: User["id"]): Promise<Chat[]> {
		const user: User = await this.userRepository.findOne({ where: { id: user_id }, relations: ['chats', 'chats._owner'] });
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user.chats;
	}
/*
	async createUser(user: CreateUserDto): Promise<User> {
		if (await this.userRepository.findOne({ username: user.username }))
			throw new HttpException('Username already in use', HttpStatus.BAD_REQUEST);
		const newUser = await this.userRepository.create(user);
		this.userRepository.save(newUser);
		return newUser;
	}
*/
	async updateUser(id: User["id"], user: UpdateUserDto): Promise<any> {
		if (!regex.test(id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const old = await this.userRepository.findOne(id);
		if (!old)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		if (old.username !== user.username && await this.userRepository.findOne({ username: user.username }))
			throw new HttpException(`Username '${user.username}' already in use`, HttpStatus.BAD_REQUEST);
		await this.userRepository.update(id, user);
		this.onStatusChange?.call(null, id);
		return { success: true };
	}

	async addAvatar(id: User["id"], imageBuffer: Buffer) {
		if (!regex.test(id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const user = await this.userRepository.findOne(id);
		const avatar = await this.databaseFileService.uploadDatabaseFile(imageBuffer);
		await this.userRepository.update(id, { avatar_id: avatar.id });
		this.onStatusChange?.call(null, id);
		if (user.avatar_id)
			await this.databaseFileService.deleteDatabaseFile(user.avatar_id);
		return {success: true};
	}

	async addFriendByID(user_id: User["id"], friend_id: User["id"]): Promise<User> {
		if (!regex.test(user_id) || !regex.test(friend_id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const user: User = await this.userRepository.findOne(user_id);
		const friend: User = await this.userRepository.findOne(friend_id);
		return this.addFriend(user, friend);
	}

	async addFriendByName(user_id: User["id"], friend_username: string): Promise<User> {
		if (!regex.test(user_id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const user: User = await this.userRepository.findOne(user_id);
		const friend: User = await this.userRepository.findOne({ where: {username: friend_username}});
		return this.addFriend(user, friend);
	}

	async addFriend(user: User, friend: User): Promise<User> {
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		if (!friend)
			throw new HttpException('Friend not found', HttpStatus.NOT_FOUND);
		if (user.friends.indexOf(friend.id) !== -1)
			throw new HttpException('User already befriended', HttpStatus.BAD_REQUEST);
		if (user.id === friend.id)
			throw new HttpException('Cannot befriend yourself', HttpStatus.BAD_REQUEST);
		user.friends.push(friend.id);
		await this.userRepository.update(user.id, user);
		const updatedUser = await this.userRepository.findOne(user.id);
		if (updatedUser)
			return updatedUser;
		throw new HttpException('Update failed', HttpStatus.NOT_FOUND);
	}

	async removeFriendByID(user_id: User["id"], friend_id: User["id"]): Promise<User> {
		if (!regex.test(user_id) || !regex.test(friend_id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const user: User = await this.userRepository.findOne(user_id);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		const i = user.friends.indexOf(friend_id);
		if (i === -1)
			throw new HttpException('Friend not found', HttpStatus.NOT_FOUND);
		user.friends.splice(i, 1);
		await this.userRepository.update(user_id, user);
		const updatedUser = await this.userRepository.findOne(user_id);
		if (updatedUser)
			return updatedUser;
		throw new HttpException('Update failed', HttpStatus.NOT_FOUND);
	}

	async removeFriendByName(user_id: User["id"], friend_username: string): Promise<User> {
		if (!regex.test(user_id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const user: User = await this.userRepository.findOne(user_id);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		const friend: User = await this.userRepository.findOne({where: {username: friend_username}});
		if (!friend)
			throw new HttpException('Friend not found', HttpStatus.NOT_FOUND);
		const i = user.friends.indexOf(friend.id);
		if (i === -1)
			throw new HttpException('Friend not found', HttpStatus.NOT_FOUND);
		user.friends.splice(i, 1);
		await this.userRepository.update(user_id, user);
		const updatedUser = await this.userRepository.findOne(user_id);
		if (updatedUser)
			return updatedUser;
		throw new HttpException('Update failed', HttpStatus.NOT_FOUND);
	}

	async addBlockedByID(user_id: User["id"], blocked_id: User["id"]): Promise<User> {
		if (!regex.test(user_id) || !regex.test(blocked_id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const user: User = await this.userRepository.findOne(user_id);
		const blocked: User = await this.userRepository.findOne(blocked_id);
		return this.addBlocked(user, blocked);
	}

	async addBlockedByName(user_id: User["id"], blocked_username: string): Promise<User> {
		if (!regex.test(user_id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const user: User = await this.userRepository.findOne(user_id);
		const blocked: User = await this.userRepository.findOne({where: {username: blocked_username}});
		return this.addBlocked(user, blocked);
	}

	async addBlocked(user: User, blocked: User): Promise<User> {
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		if (!blocked)
			throw new HttpException('Blocked not found', HttpStatus.NOT_FOUND);
		if (user.blocked.indexOf(blocked.id) !== -1)
			throw new HttpException('User already blocked', HttpStatus.BAD_REQUEST);
		if (user.id === blocked.id)
			throw new HttpException('Cannot block yourself', HttpStatus.BAD_REQUEST);
		user.blocked.push(blocked.id);
		await this.userRepository.update(user.id, user);
		const updatedUser = await this.userRepository.findOne(user.id);
		if (updatedUser)
			return updatedUser;
		throw new HttpException('Update failed', HttpStatus.NOT_FOUND);
	}

	async removeBlockedByID(user_id: User["id"], blocked_id: User["id"]): Promise<User> {
		if (!regex.test(user_id) || !regex.test(blocked_id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const user: User = await this.userRepository.findOne(user_id);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		const i = user.blocked.indexOf(blocked_id);
		if (i === -1)
			throw new HttpException('User not blocked', HttpStatus.NOT_FOUND);
		user.blocked.splice(i, 1);
		await this.userRepository.update(user_id, user);
		const updatedUser = await this.userRepository.findOne(user_id);
		if (updatedUser)
			return updatedUser;
		throw new HttpException('Update failed', HttpStatus.NOT_FOUND);
	}

	async removeBlockedByName(user_id: User["id"], blocked_username: string): Promise<User> {
		if (!regex.test(user_id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		const user: User = await this.userRepository.findOne(user_id);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		const blocked: User = await this.userRepository.findOne({where: {username: blocked_username}});
		if (!blocked)
			throw new HttpException('Blocked user not found', HttpStatus.NOT_FOUND);
		const i = user.blocked.indexOf(blocked.id);
		if (i === -1)
		throw new HttpException('User not blocked', HttpStatus.NOT_FOUND);
		user.blocked.splice(i, 1);
		await this.userRepository.update(user_id, user);
		const updatedUser = await this.userRepository.findOne(user_id);
		if (updatedUser)
			return updatedUser;
		throw new HttpException('Update failed', HttpStatus.NOT_FOUND);
	}

	async deleteUser(id: User["id"]): Promise<void> {
		if (!regex.test(id))
			throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
		await this.userRepository.delete(id);
	}

	async setTwoFactorAuthenticationSecret(secret: string, userId: string) {
		return this.userRepository.update(userId, { twoFactorAuthSecret: secret });
	}

	async turnOnTwoFactorAuthentication(userId: string) {
		return this.userRepository.update(userId,
		{
			isTwoFactorEnable: true,
		});
	}

	async turnOffTwoFactorAuthentication(userId: string) {
		return this.userRepository.update(userId,
		{
			isTwoFactorEnable: false,
		})
	}

	async setStatus(user: User["id"], status: Status) {
		const r = await this.userRepository.update(user, {
			status
		});
		this.onStatusChange?.call(null, user);
		return r;
	}

	private delta(user_rating: number, opponent_rating: number, status: EloStatus, k: number) {
		const prob = 1 / (1 + Math.pow(10, (opponent_rating - user_rating) / 400));
		return Math.round(k * (status - prob));
	}

	private getCoefficient(game_nb: number, rating: number): number {
		if (game_nb < 30 || rating > 1800)// TODO check values with mates
			return 40;
		else if (game_nb < 50 || rating > 2200)
			return 30;
		else if (game_nb < 100 || rating > 2400)
			return 20;
		return 10;
	}

	async endRankedGame(winner: Partial<User>, loser: Partial<User>) {
		let win: User = await this.userRepository.findOne(winner.id);
		const old_rating = win.rating;
		const win_k = this.getCoefficient(win.win_number + win.lose_number, win.rating);
		let los: User = await this.userRepository.findOne(loser.id);
		const los_k = this.getCoefficient(los.win_number + los.lose_number, los.rating);
		win.rating += this.delta(win.rating, los.rating, EloStatus.WIN, win_k);
		los.rating += this.delta(los.rating, old_rating, EloStatus.LOOSE, los_k);
		await this.userRepository.update({ id: winner.id }, { win_number: () => "win_number + 1", rating: win.rating });
		await this.userRepository.update({ id: loser.id }, { lose_number: () => "lose_number + 1", rating: los.rating });
	}

	async endGame(winner: Partial<User>, loser: Partial<User>) {
		await this.userRepository.update({ id: winner.id }, { win_number: () => "win_number + 1" });
		await this.userRepository.update({ id: loser.id }, { lose_number: () => "lose_number + 1" });
	}

	async incrementAchievementCounter(user_id: User["id"], category_name: string): Promise<void> {
		let user = await this.userRepository.findOne(user_id);
		if (!user) {
			console.log('user not found');
			return ;
		}
		const category: Category = user.achievementList.find(elem => elem.name === category_name);
		if (!category) {
			console.log("achievement " + category_name +" not found")
			return ;
		}
		const i = user.achievementList.indexOf(category);
		category.counter++;
		category.achievements.forEach(elem => {
			if (!elem.date && category.counter >= elem.goal){
				elem.date = new Date();
				this.onTrophyUnlocked?.call(null, user.id, category_name, elem.level);
			}
		});
		user.achievementList[i] = category;
		await this.userRepository.update({id: user.id }, { achievementList: user.achievementList });
	}

	async setAchievementCounter(user_id: User["id"], category_name: string, new_count: number): Promise<void> {
		let user = await this.userRepository.findOne(user_id);
		if (!user) {
			console.log('user not found');
			return ;
		}
		const category: Category = user.achievementList.find(elem => elem.name === category_name);
		if (!category) {
			console.log("achievement " + category_name +" not found")
			return ;
		}
		const i = user.achievementList.indexOf(category);
		if (new_count <= category.counter)
			return ;
		category.counter = new_count;
		category.achievements.forEach(elem => {
			if (!elem.date && category.counter >= elem.goal){
				elem.date = new Date();
				this.onTrophyUnlocked?.call(null, user.id, category_name, elem.level);
			}
		});
		user.achievementList[i] = category;
		await this.userRepository.update({id: user.id }, { achievementList: user.achievementList });
	}
}
