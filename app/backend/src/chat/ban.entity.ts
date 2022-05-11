import { JoinColumn, Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../user/user.entity';
import { Chat } from './chat.entity';

@Entity()
export class Ban extends BaseEntity {

  @ManyToOne(() => Chat, chat => chat.banList, { onDelete: "CASCADE" })
  public chat: Chat;

  @Column("text")
  public user: User["id"];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user' })
  public _user: User;

  @Column('timestamp', { nullable: true, default: null })
  public timestamp: Date;

}
