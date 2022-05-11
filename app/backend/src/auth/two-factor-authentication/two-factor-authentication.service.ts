import { Injectable, Req } from '@nestjs/common';
import { authenticator } from 'otplib'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service';
import { toFileStream } from 'qrcode'
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthenticationService {


	constructor(
		private readonly userService: UserService,
	) {}

	async isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, @Req() req: any) {
		const user = await this.userService.findUserById(req.user.id);

		return authenticator.verify( {
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthSecret
		} );
	}

	async generateTwoFactorAuthenticationSecret(user: User)
	{
		const secret = authenticator.generateSecret();

		const otpauthUrl = authenticator.keyuri(user.username, process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME, secret);

		await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);

		return {
			secret,
			otpauthUrl
		}
	}

	async pipeQrCodeStream(stream: Response, otpauthUrl: string){
		return toFileStream(stream, otpauthUrl);
	}

}
