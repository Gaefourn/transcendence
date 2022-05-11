import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Console, IdContext} from 'src/Logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const response =
      exception instanceof HttpException
        ? exception.getResponse()
        : HttpStatus.INTERNAL_SERVER_ERROR;

	const httpMessage = (response as any).message
	? (response as any).message
	: response

    const responseBody = {
      statusCode: httpStatus,
      message: httpMessage,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    Console.ctx_warn(new IdContext(responseBody.path), httpStatus, httpMessage);
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

