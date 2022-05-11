import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../user/user.entity';

@Entity()
export class Game extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string & { ___brand: "gameId" };

  @Column({ type: 'uuid' })
  public user1: User["id"];

  @Column({ type: 'smallint', default: 0 })
  public user1_score: number;

  @Column({ type: 'uuid' })
  public user2: User["id"];

  @Column({ type: 'smallint', default: 0 })
  public user2_score: number;

  @Column({ nullable: true })
  public ended: Date;

  @ManyToOne(() => User, user => user.winned_games, { cascade: true, eager: true})
  public winner: User;

  @ManyToOne(() => User, user => user.lost_games, { cascade: true, eager: true})
  public loser: User;

  @Column({ type: 'boolean', default : false })
  public custom: boolean;
}
