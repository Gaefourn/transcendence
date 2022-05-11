import { Strategy } from 'passport-oauth2'
import { PassportStrategy } from '@nestjs/passport'
import {Injectable, Logger} from '@nestjs/common'
import { AuthService } from '../auth.service';
import axios from "axios";

export const ftStrategy = '42';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, ftStrategy) {
	constructor(private authService: AuthService) {
		super({
			clientID: process.env.FT_CLIENT_ID,
			clientSecret: process.env.FT_CLIENT_SECRET,
			callbackURL: process.env.FT_CALLBACK_URL,
			scope: ['public'],
			authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
			tokenURL: 'https://api.intra.42.fr/oauth/token'
		});
	}

	async validate(accessToken: string) {
		const res = await axios.get('https://api.intra.42.fr/v2/me', { headers: { authorization: 'Bearer ' + accessToken }});
		const { data: { login: username, id: ftID } } = res;
		return this.authService.validateUser({ username, ftID });
	}
}
