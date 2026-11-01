import { MigrationInterface, QueryRunner } from "typeorm";

export class BusinessRegistrationRequest1793509765706 implements MigrationInterface {
    name = 'BusinessRegistrationRequest1793509765706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."business_registration_requests_status_enum" AS ENUM('pending', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "business_registration_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "tax_code" character varying(20) NOT NULL, "address" text, "registered_district" character varying(100), "registered_province" character varying(100), "license_date" date, "foreign_name" character varying(255), "email" character varying(255) NOT NULL, "office_phone" character varying(50), "operating_province" character varying(100), "operating_district" character varying(100), "business_location" text, "representative_name" character varying(100), "representative_phone" character varying(50), "business_type_id" uuid NOT NULL, "business_industry_id" uuid NOT NULL, "gpkd_file_path" text, "other_document_path" text, "is_active" boolean NOT NULL DEFAULT true, "otp_hash" character varying(255), "otp_expires_at" TIMESTAMP WITH TIME ZONE, "status" "public"."business_registration_requests_status_enum" NOT NULL DEFAULT 'pending', CONSTRAINT "UQ_784177e55a3f57c1e5d8f12e93d" UNIQUE ("tax_code"), CONSTRAINT "PK_b65a52c77312e20b08642fa3f39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_784177e55a3f57c1e5d8f12e93" ON "business_registration_requests" ("tax_code") `);
        await queryRunner.query(`ALTER TABLE "business_registration_requests" ADD CONSTRAINT "FK_5b34a61f44799277ad6b044404a" FOREIGN KEY ("business_type_id") REFERENCES "business_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "business_registration_requests" ADD CONSTRAINT "FK_fd33fa807fe6bdcc9c732e75ce7" FOREIGN KEY ("business_industry_id") REFERENCES "business_industries"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "business_registration_requests" DROP CONSTRAINT "FK_fd33fa807fe6bdcc9c732e75ce7"`);
        await queryRunner.query(`ALTER TABLE "business_registration_requests" DROP CONSTRAINT "FK_5b34a61f44799277ad6b044404a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_784177e55a3f57c1e5d8f12e93"`);
        await queryRunner.query(`DROP TABLE "business_registration_requests"`);
        await queryRunner.query(`DROP TYPE "public"."business_registration_requests_status_enum"`);
    }

}
