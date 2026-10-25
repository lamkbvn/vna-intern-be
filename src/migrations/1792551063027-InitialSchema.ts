import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1792551063027 implements MigrationInterface {
    name = 'InitialSchema1792551063027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "business_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7b5826670252d05980aa622e934" UNIQUE ("code"), CONSTRAINT "PK_3c34c2b0b96fd7d13d7b4750b27" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "business_industries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "level" smallint NOT NULL, "parent_id" uuid, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c80b932e8fd4beb63e4f3c01649" UNIQUE ("code"), CONSTRAINT "PK_ed710d7ec1d21fed52d12d07503" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e36788e108a35bef8228c8524d" ON "business_industries" ("level") `);
        await queryRunner.query(`CREATE INDEX "IDX_6d24946494eb98ff7d1da33a96" ON "business_industries" ("parent_id") `);
        await queryRunner.query(`CREATE TABLE "businesses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "tax_code" character varying(10) NOT NULL, "address" text, "registered_district" character varying(100), "registered_province" character varying(100), "license_date" date, "foreign_name" character varying(255), "email" character varying(255) NOT NULL, "office_phone" character varying(50), "operating_province" character varying(100), "operating_district" character varying(100), "business_location" text, "representative_name" character varying(100), "representative_phone" character varying(50), "business_type_id" uuid NOT NULL, "business_industry_id" uuid NOT NULL, "gpkd_file_path" text, "other_document_path" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9ccbc0abaf5213d511bf7512704" UNIQUE ("tax_code"), CONSTRAINT "PK_bc1bf63498dd2368ce3dc8686e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9ccbc0abaf5213d511bf751270" ON "businesses" ("tax_code") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'DOANH_NGHIEP')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(100) NOT NULL, "password_hash" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "full_name" character varying(100) NOT NULL, "gender" "public"."users_gender_enum" NOT NULL DEFAULT 'male', "date_of_birth" date, "refresh_token_hash" character varying(255), "refresh_token_expires_at" TIMESTAMP, "reset_password_otp_hash" character varying(255), "reset_password_otp_expires_at" TIMESTAMP, "change_email_otp_hash" character varying(255), "change_email_otp_expires_at" TIMESTAMP, "change_email_otp_verified" boolean NOT NULL DEFAULT false, "province" character varying, "district" character varying, "streetAddress" text, "avatar" character varying(500), "is_active" boolean NOT NULL DEFAULT true, "position" character varying(100), "role" "public"."users_role_enum" NOT NULL DEFAULT 'DOANH_NGHIEP', "business_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "business_industries" ADD CONSTRAINT "FK_6d24946494eb98ff7d1da33a967" FOREIGN KEY ("parent_id") REFERENCES "business_industries"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "FK_73094057b7c5ab456deb2b75d77" FOREIGN KEY ("business_type_id") REFERENCES "business_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "FK_45059d295de3313ddd17603e035" FOREIGN KEY ("business_industry_id") REFERENCES "business_industries"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_cde4b2aabca86cfabdc78b537f0" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_cde4b2aabca86cfabdc78b537f0"`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP CONSTRAINT "FK_45059d295de3313ddd17603e035"`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP CONSTRAINT "FK_73094057b7c5ab456deb2b75d77"`);
        await queryRunner.query(`ALTER TABLE "business_industries" DROP CONSTRAINT "FK_6d24946494eb98ff7d1da33a967"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9ccbc0abaf5213d511bf751270"`);
        await queryRunner.query(`DROP TABLE "businesses"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6d24946494eb98ff7d1da33a96"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e36788e108a35bef8228c8524d"`);
        await queryRunner.query(`DROP TABLE "business_industries"`);
        await queryRunner.query(`DROP TABLE "business_types"`);
    }

}
