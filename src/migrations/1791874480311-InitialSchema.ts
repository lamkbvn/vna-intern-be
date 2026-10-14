import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1791874480311 implements MigrationInterface {
    name = 'InitialSchema1791874480311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(100) NOT NULL, "password_hash" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "full_name" character varying(100) NOT NULL, "gender" "public"."users_gender_enum" NOT NULL DEFAULT 'male', "date_of_birth" date, "refresh_token_hash" character varying(255), "refresh_token_expires_at" TIMESTAMP, "reset_password_otp_hash" character varying(255), "reset_password_otp_expires_at" TIMESTAMP, "province" character varying, "district" character varying, "streetAddress" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "province" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "district" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "streetAddress" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
