import { Controller, Get, Res, UseGuards, Request, Post, Req, Query, HttpException, HttpStatus, HttpCode, Body, UnauthorizedException, Put, Delete } from '@nestjs/common';
import { FtAuthGuard, JwtTwoFactorGuard, JwtGuard } from './guards';
import { Response } from 'express'
import { AuthService } from './auth.service';
import { TwoFactorAuthenticationService } from './two-factor-authentication/two-factor-authentication.service';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {

	constructor(
		private readonly authService: AuthService,
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly userService: UserService,
		) {}

	// This is the route the user will visit to authenticate -> /auth/login
	@Get('login')
	@UseGuards(FtAuthGuard)
	async login(@Res() res: Response, @Req() req: any) {
		const user = await this.userService.findUserById(req.user.id);
		const token = this.authService.login(req.user);
		 res.cookie(user.isTwoFactorEnable ? '2fa_token' : 'access_token', token.access_token, {
		     httpOnly: true
		 });
		res.send({ tfa: user.isTwoFactorEnable });
	}

	@Get('tfa')
	@UseGuards(JwtGuard)
	async register(@Res() response: Response, @Req() req: any) {
		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(req.user);

		response.setHeader('Content-Type', 'image/png');

		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}


	@Delete('tfa')
	@UseGuards(JwtGuard)
	async disableTwoFactorAuthentication(@Req() req: any, @Body()  twoFactorAuthenticationCode : string) {
		if (await this.authService.getTfaStatus(req.user.id))
			await this.userService.turnOffTwoFactorAuthentication(req.user.id);
		return { success: true };
	}

	@Post('tfa')
	@UseGuards(JwtGuard)
	async enableTwoFactorAuthentication(@Req() req: any, @Body('code')  twoFactorAuthenticationCode : string) {
		const isCodeValid = await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, req);

		if (!isCodeValid)
			throw new UnauthorizedException('Wrong authentication code.');
		await this.userService.turnOnTwoFactorAuthentication(req.user.id);
		return { success: true };
	}

	@Post('login')
	@UseGuards(JwtTwoFactorGuard)
	async twoFactorAuthenticationLogin(@Req() req: any, @Body('code')  twoFactorAuthenticationCode : string, @Res() res: Response) {
		const isCodeValid = await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, req);

		if (!isCodeValid)
			throw new UnauthorizedException('Wrong authentication code.');
		res.cookie('access_token', req.cookies['2fa_token'], {
			httpOnly: true,
		})
		.cookie('2fa_token', 'expired',{ maxAge:0 })
		.send({success: true})
	}


	@Get('dummy')
	async dummyLogin(@Res() res:Response, @Query() query:any){
		if (process.env.NODE_ENV !== "development")
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		const token = await this.authService.dummyLogin(query.name);
		res.cookie('access_token', token.access_token, {
			httpOnly:true,
		}).send({ success:true });
	}

	// Logging out -> /auth/logout
	@Get('logout')
	logout(@Res() res: Response, @Req() req: any) {
		res.cookie('access_token', 'expired',{
			maxAge:0,
		}).send({ success: true })
	}

	@Get('connected')
	connected(@Req() req: any) {
		const token = req.cookies && req.cookies['access_token'];
		return { connected: !!token };
	}

}
