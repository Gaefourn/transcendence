import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Entity()
export class BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn()
  public created_at: Date;

  @UpdateDateColumn()
  public updated_at: Date;

  @VersionColumn()
  public version: number;

}
