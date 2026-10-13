import { MigrationInterface, QueryRunner } from "typeorm";

export class SecondSchema1791878644462 implements MigrationInterface {
    name = 'SecondSchema1791878644462'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "pending_email" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "change_email_otp_hash" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "change_email_otp_expires_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "change_email_otp_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "change_email_otp_hash"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pending_email"`);
    }

}
