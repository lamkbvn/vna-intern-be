import { MigrationInterface, QueryRunner } from "typeorm";

export class Isdeleteduser1792551409641 implements MigrationInterface {
    name = 'Isdeleteduser1792551409641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "is_deleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_deleted"`);
    }

}
