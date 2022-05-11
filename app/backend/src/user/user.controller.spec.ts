import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';

describe('User', () => {
  let app: INestApplication;
  let userService = { findAllUsers: () => [] };
  let spectateService = { findAllGames: () => [] };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ AppModule ],
    })
    .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/GET user', async () => {
    return request(app.getHttpServer())
    .get('/user')
    .expect(200);
  });
});
