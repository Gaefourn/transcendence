import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/base.entity';

@Entity()
export class DatabaseFile extends BaseEntity {

  @PrimaryGeneratedColumn()
  public id!: string & { ___brand: "databaseFileId" };

  @Column({ type: 'bytea' })
  data: Uint8Array;
  
}
