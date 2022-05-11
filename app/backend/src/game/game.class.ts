import { Game } from 'src/game/game.entity';
import { User } from 'src/user/user.entity';
import { UserClass } from 'src/user/user.class';

export class GameClass {

  constructor(game: Game) {
    this.id = game.id;
    this.user1 = (game.user1 === game.winner.id) ? new UserClass(game.winner) : new UserClass(game.loser);
    this.user1_score = game.user1_score;
    this.user2 = (game.user2 === game.winner.id) ? new UserClass(game.winner) : new UserClass(game.loser);
    this.user2_score = game.user2_score;
    this.ended = game.ended;
    this.winner = game.winner.id;
    this.loser = game.loser.id;
    this.custom = game.custom;
  }

  public id: Game["id"];

  public user1: UserClass;

  public user1_score: number;

  public user2: UserClass;

  public user2_score: number;

  public ended: Date;

  public winner: User["id"];

  public loser: User["id"];

  public custom: boolean;

}
