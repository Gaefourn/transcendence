import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { CreateGameDTO } from './create-game.dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GameService {
  constructor (
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    private userService: UserService,
  ) {}

  findAllGames(): Promise<Game[]> {
    return this.gameRepository.find({ order: { ended: 'DESC'}, take: 100});
  }

  findGameById(id: string): Promise<Game> {
    const game = this.gameRepository.findOne(id);
    if (game) {
      return game;
    }
    throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
  }

  async findGameByUserId(user_id: User["id"]): Promise<Game[]> {
    const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    if (!regex.test(user_id)) {
      throw new HttpException('Invalid id format', HttpStatus.NOT_FOUND);
    }
    const arr: Game[] = await this.gameRepository.find({ where: { user1: user_id }, order: { ended: 'DESC'}, take: 20});
    return arr.concat(await this.gameRepository.find({ where: { user2: user_id }, order: { ended: 'DESC'}, take: 20}));
  }

  async createGame(raw: CreateGameDTO): Promise<Game> {
    const game = this.gameRepository.create(raw);
    await this.gameRepository.insert(raw)
      .then(async () => {
        if (raw.custom)
          await this.userService.endGame(raw.winner, raw.loser);
        else {
          await this.userService.endRankedGame(raw.winner, raw.loser);
          await this.userService.incrementAchievementCounter(raw.winner.id, "playGame");
          await this.userService.incrementAchievementCounter(raw.winner.id, "winGame");
          await this.userService.incrementAchievementCounter(raw.loser.id, "playGame");
        }
      })
      .catch((e) => {
        console.warn(e);
      });
    return game;
  }

}
