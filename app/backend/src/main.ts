import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from 'src/allException.filter';

if (process.env.BACK_PORT == undefined)
	throw "Environnement variable BACK_PORT is empty.";

const FPORT = process.env.FRONT_PORT ?? 80;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
  app.use(cookieParser());
  const cors = process.env.NODE_ENV == 'production' ? ['https://transcendence.sethlantis.net'] : [`http://localhost:${FPORT}`, `http://127.0.0.1:${FPORT}`, `http://192.168.0.13:${FPORT}`];
  app.enableCors({origin: cors, credentials: true });
  await app.listen(process.env.BACK_PORT);
}
bootstrap();
