import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { DatabaseFile } from './databaseFile.entity';
 
const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

@Injectable()
export class DatabaseFileService {
  constructor (
    @InjectRepository(DatabaseFile)
    private databaseFileRepository: Repository<DatabaseFile>,
  ) {}

  async findAllFiles(): Promise<DatabaseFile[]> {
    return await this.databaseFileRepository.find();
  }

  async findFileById(file_id: DatabaseFile["id"]): Promise<DatabaseFile> {
    if (!regex.test(file_id))
      throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
    const file = await this.databaseFileRepository.findOne(file_id);
    if (!file)
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    return file;
  }

  async uploadDatabaseFile(dataBuffer: Buffer): Promise<DatabaseFile> {
    const newFile: DatabaseFile = await this.databaseFileRepository.create({ data: dataBuffer });
    return await this.databaseFileRepository.save(newFile);
  }

  async deleteDatabaseFile(file_id: DatabaseFile["id"]): Promise<void> {
    if (!regex.test(file_id))
      throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
    const file = await this.databaseFileRepository.findOne(file_id);
    this.databaseFileRepository.remove(file);
  }

}
