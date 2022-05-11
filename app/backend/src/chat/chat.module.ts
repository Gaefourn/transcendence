import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Chat } from './chat.entity';
import { Mute } from './mute.entity';
import { Ban } from './ban.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/user.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat]),
    TypeOrmModule.forFeature([Mute]),
    TypeOrmModule.forFeature([Ban]),
    TypeOrmModule.forFeature([User]),
    UserModule
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
