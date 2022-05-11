import {MigrationInterface, QueryRunner} from "typeorm";

export class refatco1651238135850 implements MigrationInterface {
    name = 'refatco1651238135850'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mute" DROP CONSTRAINT "FK_957f240f68a5f7cc49f6737a3ce"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_ae88d8de23e69a0d57105a5bce5"`);
        await queryRunner.query(`ALTER TABLE "ban" DROP CONSTRAINT "FK_42b00b47164747240a163c318b7"`);
        await queryRunner.query(`ALTER TABLE "mute" RENAME COLUMN "userId" TO "user"`);
        await queryRunner.query(`ALTER TABLE "chat" RENAME COLUMN "ownerId" TO "owner"`);
        await queryRunner.query(`ALTER TABLE "ban" RENAME COLUMN "userId" TO "user"`);
        await queryRunner.query(`ALTER TABLE "mute" ALTER COLUMN "user" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "owner" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ban" ALTER COLUMN "user" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mute" ADD CONSTRAINT "FK_20fbddd30627eb958a47cec4db4" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_2cc5841d9e6e6c5ea7ed8e333e3" FOREIGN KEY ("owner") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ban" ADD CONSTRAINT "FK_7f060b88e3372f873a4ae928e98" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ban" DROP CONSTRAINT "FK_7f060b88e3372f873a4ae928e98"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_2cc5841d9e6e6c5ea7ed8e333e3"`);
        await queryRunner.query(`ALTER TABLE "mute" DROP CONSTRAINT "FK_20fbddd30627eb958a47cec4db4"`);
        await queryRunner.query(`ALTER TABLE "ban" ALTER COLUMN "user" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "owner" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mute" ALTER COLUMN "user" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ban" RENAME COLUMN "user" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "chat" RENAME COLUMN "owner" TO "ownerId"`);
        await queryRunner.query(`ALTER TABLE "mute" RENAME COLUMN "user" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "ban" ADD CONSTRAINT "FK_42b00b47164747240a163c318b7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_ae88d8de23e69a0d57105a5bce5" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mute" ADD CONSTRAINT "FK_957f240f68a5f7cc49f6737a3ce" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
