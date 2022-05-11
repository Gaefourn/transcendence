import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { User } from '../user/user.entity';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { OngoingGameService } from './ongoingGame.service';
import { UserModule } from 'src/user/user.module';
import MatchmakerService from "./matchmaker.service"

@Module({
	imports: [
		TypeOrmModule.forFeature([Game]),
        TypeOrmModule.forFeature([User]),
		UserModule,
	],
	controllers: [GameController],
	providers: [
		GameService,
		GameGateway,
		MatchmakerService,
		OngoingGameService,
	],
})
export class GameModule {}
