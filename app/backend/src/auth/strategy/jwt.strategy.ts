import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'

export const jwtStrategy = 'jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, jwtStrategy) {

	constructor() {
		super({
			jwtFromRequest: req => {
				if (!req || !req.cookies) return null;
				return req.cookies['access_token']
			},
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET,
		});
	}

	async validate(payload: any) {
		return { id: payload.id, username: payload.username };
	}

}
