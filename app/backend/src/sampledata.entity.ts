import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class SampleData {
	@PrimaryColumn()
	public key: string;

	@Column()
	public value: string;
}
