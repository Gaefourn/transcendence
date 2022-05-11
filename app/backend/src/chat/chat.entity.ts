import {
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn, JoinColumn
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '../base.entity';
import { User } from '../user/user.entity';
import { Mute } from './mute.entity';
import { Ban } from './ban.entity';

@Entity()
export class Chat extends BaseEntity {

  @BeforeInsert()
  private async hashPassword() {
    if (this.password)
      this.password = await bcrypt.hash(this.password, 10);
  }

  @AfterLoad()
  private loadOldPassword() {
      this.oldPassword = this.password;
  }

  @AfterLoad()
  private trimLists() {
    if (this.muteList) {
      this.muteList = this.muteList.filter(elem => {
        if (!elem.timestamp)
          return true;
        return elem.timestamp > new Date();
      });
    }
    if (this.banList) {
      this.banList = this.banList.filter(elem => {
        if (!elem.timestamp)
          return true;
        return elem.timestamp > new Date();
      });
    }
  }

  @BeforeUpdate()
  private async hashNewPassword() {
    if (this.password && this.password !== this.oldPassword)
      this.password = await bcrypt.hash(this.password, 10);
  }

  @PrimaryGeneratedColumn('uuid')
  id!: string & { ___brand: "chatId" };

  @Column({ nullable: false, length: 20, unique: true })//TODO define with mates
  public name: string;

  @ManyToOne(type => User, user => user.owned_chats)
  @JoinColumn({ name: "owner" })
  _owner: User;

  @Column("text", { nullable: false })
  public owner: User["id"];

  @JoinTable()
  @ManyToMany(() => User, user => user.chats)
  public users: User[];

  @Column({ default: false })
  public isPrivate: boolean;

  @Column({ nullable: true, default: null })
  public password: string;

  private oldPassword: string;

  @Column("text", { array: true, default: [] })
  public admins: User['id'][];

  @OneToMany(() => Mute, mute => mute.chat)
  public muteList: Mute[];

  @OneToMany(() => Ban, ban => ban.chat)
  public banList: Ban[];

}
