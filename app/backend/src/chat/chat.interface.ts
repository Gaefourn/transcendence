import { User } from '../user/user.entity';

export class Chat  {

  id!: string & { ___brand: "chatId" };

  public name: string;

  public owner: User;

  public banlist: {user: User, end: Date}[];

  public mutelist: {user: User, end: Date}[];

  public is_private: boolean;

  public password: string;

}
