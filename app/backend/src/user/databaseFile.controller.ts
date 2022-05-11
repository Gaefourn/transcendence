import { Get, Param, Controller, UseGuards, UseInterceptors, ClassSerializerInterceptor, StreamableFile, HttpException, Res } from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import { DatabaseFileService }from './databaseFile.service';
import { DatabaseFile }from './databaseFile.entity';
import {JwtGuard} from "../auth/guards";

@Controller('avatars')
@UseInterceptors(ClassSerializerInterceptor)
export class DatabaseFileController {
  constructor(
	  private readonly databaseFileService: DatabaseFileService,
  ) {}

  @Get()
  @UseGuards(JwtGuard)
  async findAll(): Promise<DatabaseFile["id"][]> {
    return (await this.databaseFileService.findAllFiles()).map((elem) => {
      return elem.id;
    });
  }

  @Get('/:id')
  @UseGuards(JwtGuard)
  async findFileById(@Param('id') file_id: DatabaseFile["id"], @Res({ passthrough: true }) res: Response) {
    const file = await this.databaseFileService.findFileById(file_id);
    const stream = Readable.from(file.data);
    res.set({
      'Content-Type': 'image',
      'Content-Disposition': 'inline'
    });
    return new StreamableFile(stream);
  }
}

