import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from 'src/ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(OrmConfig)],
  controllers: [],
  providers: [],
})
export class DatabaseModule {};
