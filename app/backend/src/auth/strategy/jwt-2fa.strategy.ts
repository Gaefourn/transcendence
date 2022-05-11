import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable } from '@nestjs/common'

export const jwt2fa = 'jwt-two-factor';

@Injectable()
export class Jwt2fa extends PassportStrategy(Strategy, jwt2fa) {

	constructor() {
		super({
			jwtFromRequest: req => {
				if (!req || !req.cookies) return null;
				return req.cookies['2fa_token']
			},
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET,
		});
	}

	async validate(payload: any) {
		return { id: payload.id, username: payload.username };
	}

}
