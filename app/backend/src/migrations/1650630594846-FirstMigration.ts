import {MigrationInterface, QueryRunner} from "typeorm";

export class FirstMigration1650630594846 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

       await queryRunner.query(`

DROP TABLE IF EXISTS "ban";
CREATE TABLE "public"."ban" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer NOT NULL,
    "timestamp" timestamp,
    "chatId" uuid,
    "userId" uuid,
    CONSTRAINT "PK_071cddb7d5f18439fd992490618" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "base_entity";
CREATE TABLE "public"."base_entity" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer NOT NULL,
    CONSTRAINT "PK_03e6c58047b7a4b3f6de0bfa8d7" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "chat";
CREATE TABLE "public"."chat" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer NOT NULL,
    "name" character varying(20) NOT NULL,
    "isPrivate" boolean DEFAULT false NOT NULL,
    "password" character varying,
    "admins" text[] DEFAULT '{}' NOT NULL,
    "ownerId" uuid,
    CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_6dd2eef2d624145b789394ac328" UNIQUE ("name")
) WITH (oids = false);


DROP TABLE IF EXISTS "chat_users_user";
CREATE TABLE "public"."chat_users_user" (
    "chatId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    CONSTRAINT "PK_c6af481280fb886733ddbd73661" PRIMARY KEY ("chatId", "userId")
) WITH (oids = false);

CREATE INDEX "IDX_2004be39e2b3044c392bfe3e61" ON "public"."chat_users_user" USING btree ("userId");

CREATE INDEX "IDX_6a573fa22dfa3574496311588c" ON "public"."chat_users_user" USING btree ("chatId");


DROP TABLE IF EXISTS "database_file";
CREATE TABLE "public"."database_file" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer NOT NULL,
    "data" bytea NOT NULL,
    CONSTRAINT "PK_6a48e4fea10786b44d274ba8175" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "game";
CREATE TABLE "public"."game" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer NOT NULL,
    "user1" uuid NOT NULL,
    "user1_score" smallint DEFAULT '0' NOT NULL,
    "user2" uuid NOT NULL,
    "user2_score" smallint DEFAULT '0' NOT NULL,
    "ended" timestamp,
    "custom" boolean DEFAULT false NOT NULL,
    "winnerId" uuid,
    "loserId" uuid,
    CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "mute";
CREATE TABLE "public"."mute" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer NOT NULL,
    "timestamp" timestamp,
    "chatId" uuid,
    "userId" uuid,
    CONSTRAINT "PK_35784f3fa6b4281e0fb16d6d7fc" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "sample_data";
CREATE TABLE "public"."sample_data" (
    "key" character varying NOT NULL,
    "value" character varying NOT NULL,
    CONSTRAINT "PK_f236383eb7523d2ce04e87bd450" PRIMARY KEY ("key")
) WITH (oids = false);


DROP TABLE IF EXISTS "typeorm_metadata";
CREATE TABLE "public"."typeorm_metadata" (
    "type" character varying NOT NULL,
    "database" character varying,
    "schema" character varying,
    "table" character varying,
    "name" character varying,
    "value" text
) WITH (oids = false);


DROP TABLE IF EXISTS "user";
CREATE TABLE "public"."user" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer NOT NULL,
    "username" character varying(20) NOT NULL,
    "avatar_id" uuid,
    "ftID" character varying,
    "status" smallint DEFAULT '0' NOT NULL,
    "rating" integer DEFAULT '1000' NOT NULL,
    "win_number" integer DEFAULT '0' NOT NULL,
    "lose_number" integer DEFAULT '0' NOT NULL,
    "achievementList" jsonb DEFAULT '[{"name": "playGame", "counter": 0, "achievements": [{"date": null, "goal": 1, "level": 0}, {"date": null, "goal": 10, "level": 1}, {"date": null, "goal": 50, "level": 2}]}, {"name": "winGame", "counter": 0, "achievements": [{"date": null, "goal": 1, "level": 0}, {"date": null, "goal": 10, "level": 1}, {"date": null, "goal": 50, "level": 2}]}, {"name": "ballExchange", "counter": 0, "achievements": [{"date": null, "goal": 20, "level": 0}]}, {"name": "channelCreate", "counter": 0, "achievements": [{"date": null, "goal": 1, "level": 0}, {"date": null, "goal": 5, "level": 1}]}, {"name": "channelAdmin", "counter": 0, "achievements": [{"date": null, "goal": 1, "level": 0}]}, {"name": "talk", "counter": 0, "achievements": [{"date": null, "goal": 1, "level": 0}, {"date": null, "goal": 100, "level": 1}, {"date": null, "goal": 1000, "level": 2}]}, {"name": "banned", "counter": 0, "achievements": [{"date": null, "goal": 1, "level": 0}]}]' NOT NULL,
    "friends" text[] DEFAULT '{}' NOT NULL,
    "blocked" text[] DEFAULT '{}' NOT NULL,
    "twoFactorAuthSecret" character varying,
    "isTwoFactorEnable" boolean DEFAULT false NOT NULL,
    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"),
    CONSTRAINT "REL_b777e56620c3f1ac0308514fc4" UNIQUE ("avatar_id"),
    CONSTRAINT "UQ_2dd7f9db9ecc7ab9f494ef14356" UNIQUE ("ftID"),
    CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")
) WITH (oids = false);


ALTER TABLE ONLY "public"."ban" ADD CONSTRAINT "FK_3b6fc1efcf5183db4dff38e20ac" FOREIGN KEY ("chatId") REFERENCES chat(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."ban" ADD CONSTRAINT "FK_42b00b47164747240a163c318b7" FOREIGN KEY ("userId") REFERENCES "user"(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."chat" ADD CONSTRAINT "FK_ae88d8de23e69a0d57105a5bce5" FOREIGN KEY ("ownerId") REFERENCES "user"(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."chat_users_user" ADD CONSTRAINT "FK_2004be39e2b3044c392bfe3e617" FOREIGN KEY ("userId") REFERENCES "user"(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."chat_users_user" ADD CONSTRAINT "FK_6a573fa22dfa3574496311588c7" FOREIGN KEY ("chatId") REFERENCES chat(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."game" ADD CONSTRAINT "FK_534fe1b4be4a16b996ba7d78e76" FOREIGN KEY ("loserId") REFERENCES "user"(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."game" ADD CONSTRAINT "FK_cd57acb58d1147c23da5cd09cae" FOREIGN KEY ("winnerId") REFERENCES "user"(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."mute" ADD CONSTRAINT "FK_67789265d4392a1641afc909e46" FOREIGN KEY ("chatId") REFERENCES chat(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."mute" ADD CONSTRAINT "FK_957f240f68a5f7cc49f6737a3ce" FOREIGN KEY ("userId") REFERENCES "user"(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."user" ADD CONSTRAINT "FK_b777e56620c3f1ac0308514fc4c" FOREIGN KEY (avatar_id) REFERENCES database_file(id) NOT DEFERRABLE;

		`);
	}

    public async down(queryRunner: QueryRunner): Promise<void> {
		queryRunner.query(`
DROP TABLE IF EXISTS "ban" CASCADE;
DROP TABLE IF EXISTS "base_entity" CASCADE;
DROP TABLE IF EXISTS "chat" CASCADE;
DROP TABLE IF EXISTS "chat_users_user" CASCADE;
DROP TABLE IF EXISTS "database_file" CASCADE;
DROP TABLE IF EXISTS "game" CASCADE;
DROP TABLE IF EXISTS "mute" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
		`);
    }

}
