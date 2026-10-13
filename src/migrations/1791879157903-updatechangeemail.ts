import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatechangeemail1791879157903 implements MigrationInterface {
    name = 'Updatechangeemail1791879157903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "pending_email" TO "change_email_otp_verified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "change_email_otp_verified"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "change_email_otp_verified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "change_email_otp_verified"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "change_email_otp_verified" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "change_email_otp_verified" TO "pending_email"`);
    }

}
