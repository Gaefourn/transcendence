import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { TwoFactorAuthenticationService } from './two-factor-authentication/two-factor-authentication.service';
import { AuthService } from './auth.service';
import { FtStrategy } from './strategy';
import { UserModule } from 'src/user/user.module'
import { User } from 'src/user/user.entity'
import { SessionSerializer } from './utils/Serializer';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { Jwt2fa } from './strategy/jwt-2fa.strategy';
import { JwtTwoFactorGuard } from "./guards";

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '24h' },
		}),
        UserModule
	],
  controllers: [AuthController],
  providers: [
	  AuthService,
	  FtStrategy,
	  SessionSerializer,
	  JwtStrategy,
	  TwoFactorAuthenticationService,
	  Jwt2fa,
	  JwtTwoFactorGuard,
	],
	exports: [
		JwtModule,
	  	Jwt2fa,
	 	 JwtTwoFactorGuard,
	]
})
export class AuthModule {}
