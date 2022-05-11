import { HttpException, HttpStatus, Inject, Injectable, Req, Body, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity'
import { Repository } from 'typeorm';
import { UserDetails } from './utils'
import { JwtService } from '@nestjs/jwt';
import { TwoFactorAuthenticationService } from './two-factor-authentication/two-factor-authentication.service';

@Injectable()
export class AuthService {

	constructor(
		@InjectRepository(User) private userRepo: Repository<User>,
		private jwtService: JwtService,
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService
		)
	{}
	async validateUser(details: UserDetails) {
		const user = await this.userRepo.findOne({ftID: details.ftID});
		if (user)
			return user;
		return this.createUser(details);
	}

	createUser(details: UserDetails) {
		const user = {username: details.username, ftID: details.ftID}
		return this.userRepo.save(this.userRepo.create(user));
	}

	findUser(idToSearch: string) : Promise<User | undefined>{
		return this.userRepo.findOne({ftID: idToSearch});
	}

	login(user: User) : {access_token : string }{

		const payload = { username: user.username, id: user.id, TFA: user.isTwoFactorEnable };
		return {
			access_token: this.jwtService.sign(payload),
		}
	}

	async dummyLogin(dummyName:string) {
		if (process.env.NODE_ENV == "production")
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		const details = {ftID:null, username:dummyName};
		let user = await this.userRepo.findOne(details);
		if (!user)
			user = await this.createUser(details);
		const payload = {id:user.id, username:user.username}
		return {access_token: this.jwtService.sign(payload)};
	}

	 checkTFAcode(@Req() req: any, @Body() twoFactorAuthenticationCode: string) {

		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, req.user);
		if (!isCodeValid)
			return false;

		return true;
	}

	async getTfaStatus(userid: string) {
		const user = await this.userRepo.findOne(userid);

		return await user.isTwoFactorEnable;
	}

}
