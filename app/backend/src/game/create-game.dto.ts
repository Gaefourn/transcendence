//import { } from "class-validator";
import { User } from "src/user/user.entity";

export class CreateGameDTO {

  id: string;

  user1: User["id"];

  user1_score: number;

  user2: User["id"];

  user2_score: number;

  ended: Date;

  winner: Partial<User>;

  loser: Partial<User>;

  custom: boolean;
}
