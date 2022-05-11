import {BadRequestException, ExecutionContext, Injectable, Logger, UnauthorizedException} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { ftStrategy } from "../strategy";
import {jwtStrategy} from "../strategy/jwt.strategy";
import {jwt2fa} from "../strategy/jwt-2fa.strategy";

@Injectable()
export class FtAuthGuard extends AuthGuard(ftStrategy) {
  handleRequest<TUser = any>(err, user, info, context, status): TUser {
    if (!user)
      throw new UnauthorizedException();
    if (err)
      throw new BadRequestException();
    return user;
  }
}

@Injectable()
export class JwtTwoFactorGuard extends AuthGuard(jwt2fa) {}

@Injectable()
export class JwtGuard extends AuthGuard(jwtStrategy) {}
