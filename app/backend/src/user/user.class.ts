import { User } from './user.entity';
import { DatabaseFile } from './databaseFile.entity';
import { Status } from 'src/enums/status.enum';

export class UserClass {
  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.avatar_id = user.avatar_id;
    this.status = user.status;
    this.win_number = user.win_number;
    this.lose_number = user.lose_number;
    this.rank = undefined;
    this.rating = user.rating;
  }

  public id: User["id"];

  public username: string;

  public avatar_id: DatabaseFile["id"];
  
  public status: Status;

  public win_number: number;

  public lose_number: number;

  public rank: number;

  public rating: number;

}
