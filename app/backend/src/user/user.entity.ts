import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToMany, OneToOne, ManyToMany, } from 'typeorm';
import { BaseEntity } from 'src/base.entity';
import { Game } from 'src/game/game.entity';
import { AchievementList, Category } from 'src/achievement/achievementList.interface';
import { DatabaseFile } from './databaseFile.entity';
import { Chat } from 'src/chat/chat.entity';
import { Status } from 'src/enums/status.enum';

@Entity()
export class User extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  public id!: string & { ___brand: "userId" };

  @Column({ nullable: false, length: 20, unique: true })
  public username: string;

  @JoinColumn({ name: 'avatar_id' })
  @OneToOne(() => DatabaseFile, { nullable: true })
  public avatar: DatabaseFile;

  @Column({ nullable: true })
  public avatar_id: DatabaseFile["id"];

  @Column({ nullable: true, unique : true })
  public ftID: string;

  @Column('smallint', { default: Status.Offline })
  public status: Status;

  @Column({ type: 'int', default: 1000 })
  public rating: number;

  @OneToMany(() => Game, game => game.winner)
  public winned_games: Game[];

  @Column({ default: 0 })
  public win_number: number;

  @OneToMany(() => Game, game => game.loser)
  public lost_games: Game[];

  @Column({ default: 0 })
  public lose_number: number;

  @OneToMany(() => Chat, chat => chat._owner)
  public owned_chats: Chat[]

  @ManyToMany(() => Chat, chat => chat.users)
  public chats: Chat[];

  @Column({ type: "jsonb", default: AchievementList })
  public achievementList: Category[];

  @Column("text", { array: true, default: [] })
  public friends: User["id"][];

  @Column("text", { array: true, default: [] })
  public blocked: User["id"][];

  @Column({ nullable: true })
  twoFactorAuthSecret?: string;

  @Column({ default: false })
  public isTwoFactorEnable: boolean;

}
