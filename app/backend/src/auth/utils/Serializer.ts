import { Inject } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport'
import { User } from 'src/user/user.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
	
	constructor(@Inject(AuthService) private authService: AuthService) {
		super();
	}
	
	serializeUser(user : User, done: (err: Error, user: User) => void) {
		done(null, user);
	}
	
	async deserializeUser(user : User, done: (err: Error, user: User) => void) {
		const userDb = await this.authService.findUser(user.ftID);
		return userDb ? done(null, userDb) : done(null, null);
	}
}