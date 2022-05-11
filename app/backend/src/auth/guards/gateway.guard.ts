import { CanActivate, createParamDecorator, ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";
import { User } from "src/user/user.entity";
import { UserService } from "src/user/user.service";


@Injectable()
export default class GatewayAuthGuard implements CanActivate 
{
	public static readonly tokenRegex = new RegExp("(?:.*;)?access_token=([^;]+)(?:;.*)?");

	public static async VerifyUser(client:Socket, jwtService:JwtService, userdb:UserService):Promise<User|null> {
		const cookie = client?.handshake?.headers?.cookie;
		if (cookie == null)
			return null;
	
		try {
			const access_token = GatewayAuthGuard.tokenRegex.exec(cookie)?.at(1);
			const jwtToken = jwtService.verify(access_token);
			return userdb.findUserById(jwtToken.id);
		} catch (e){
			return null;
		}
	}

	constructor(
		private readonly jwt:JwtService,
		private readonly userdb:UserService,
	){}

	async canActivate(context:ExecutionContext) {
		const client = context.switchToWs().getClient();
		const user = GatewayAuthGuard.VerifyUser(client, this.jwt, this.userdb);
		if (user == null)
			return false;

		client.user = user;
		return true;
	}
}

export const SockUser = createParamDecorator((_, context:ExecutionContext):User =>{
	return context.switchToWs().getClient().user;
});

export const Client = createParamDecorator((_, context:ExecutionContext):Socket =>{
	return context.switchToWs().getClient();
});

export const Data = createParamDecorator((_, context:ExecutionContext):any =>{
	return context.switchToWs().getData();
});

