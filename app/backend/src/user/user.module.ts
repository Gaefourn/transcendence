import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseFile } from './databaseFile.entity';
import { DatabaseFileService } from './databaseFile.service';
import { DatabaseFileController } from './databaseFile.controller';

import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Jwt2fa } from 'src/auth/strategy/jwt-2fa.strategy';
import { JwtTwoFactorGuard } from "src/auth/guards";

@Module({
  imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1h' },
		}),
	TypeOrmModule.forFeature([User]),
	TypeOrmModule.forFeature([DatabaseFile])
	],
	controllers: [UserController, DatabaseFileController],
	providers: [
      UserService,
      DatabaseFileService,
	  Jwt2fa,
	  JwtTwoFactorGuard
	],
	exports: [
		JwtModule,
		UserService,
        DatabaseFileService
	],
})
export class UserModule {}
