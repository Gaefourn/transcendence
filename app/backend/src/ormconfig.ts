import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const dbconfig: PostgresConnectionOptions = {
	type: "postgres",
	entities: ["dist/**/*.entity.js"],
	synchronize: process.env.NODE_ENV !== 'production',
	extra: { ssl: false },

	url:      process.env.DATABASE_URL,
	host:     process.env.POSTGRES_HOST,
	port:     parseInt(process.env.POSTGRES_PORT),
	database: process.env.POSTGRES_DB,
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD

};

export const OrmConfig: PostgresConnectionOptions = {
	...dbconfig,
	migrations: ["dist/migrations/*.js"],
	migrationsTableName: "migrations_history",
	migrationsRun: process.env.NODE_ENV === 'production',
	cli: {
		migrationsDir: "src/migrations/"
	}
}

export default OrmConfig;
