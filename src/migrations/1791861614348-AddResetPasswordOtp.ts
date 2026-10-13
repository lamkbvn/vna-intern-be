import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResetPasswordOtp1791861614348 implements MigrationInterface {
    name = 'AddResetPasswordOtp1791861614348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_password_otp_hash" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_password_otp_expires_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_password_otp_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_password_otp_hash"`);
    }

}
