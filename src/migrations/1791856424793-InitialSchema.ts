import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1791856424793 implements MigrationInterface {
    name = 'InitialSchema1791856424793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token_expires_at" TIMESTAMP`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token_expires_at"`);
    }

}
