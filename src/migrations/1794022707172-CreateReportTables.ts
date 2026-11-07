import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReportTables1794022707172 implements MigrationInterface {
    name = 'CreateReportTables1794022707172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "business_industries" DROP CONSTRAINT "FK_business_industries_parent_id"`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP CONSTRAINT "FK_businesses_business_type_id"`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP CONSTRAINT "FK_businesses_business_industry_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "users_business_id_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_business_types_code"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_business_industries_parent_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_business_industries_level"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_businesses_business_type_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_businesses_business_industry_id"`);
        await queryRunner.query(`CREATE TYPE "public"."report_type_enum" AS ENUM('tai nạn lao động', 'tai nạn lao động được hưởng trợ cấp')`);
        await queryRunner.query(`CREATE TABLE "report_accident" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."report_type_enum" NOT NULL, "total_accident" integer NOT NULL DEFAULT '0', "total_accident_death" integer NOT NULL DEFAULT '0', "total_human_injured_more_2" integer NOT NULL DEFAULT '0', "total_human_injured" integer NOT NULL DEFAULT '0', "total_female_injured" integer NOT NULL DEFAULT '0', "total_human_death" integer NOT NULL DEFAULT '0', "total_human_injured_heavy" integer NOT NULL DEFAULT '0', "total_human_injured_no_ql" integer NOT NULL DEFAULT '0', "total_female_injured_no_ql" integer NOT NULL DEFAULT '0', "total_human_death_no_ql" integer NOT NULL DEFAULT '0', "total_human_injured_heavy_no_ql" integer NOT NULL DEFAULT '0', "budget_medical" numeric(15,2) NOT NULL DEFAULT '0', "budget_salary" numeric(15,2) NOT NULL DEFAULT '0', "budget_help" numeric(15,2) NOT NULL DEFAULT '0', "total_budget" numeric(15,2) NOT NULL DEFAULT '0', "total_day_off" integer NOT NULL DEFAULT '0', "total_thiet_hai" numeric(15,2) NOT NULL DEFAULT '0', "id_report" uuid NOT NULL, CONSTRAINT "PK_bf83ae883ae03ff9f0273c9b328" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."nguyen_nhan_tai_nan_enum" AS ENUM('thiet_bi_an_toan', 'phuong_tien_bao_ve', 'to_chuc_lao_dong', 'chua_huan_luyen', 'thieu_quy_trinh_an_toan', 'dieu_kien_lam_viec', 'vi_pham_noi_quy', 'khong_su_dung_bao_ho', 'nguyen_nhan_khach_quan')`);
        await queryRunner.query(`CREATE TYPE "public"."yeu_to_chan_thuong_enum" AS ENUM('thiết bị nặng')`);
        await queryRunner.query(`CREATE TYPE "public"."nghe_nghiep_enum" AS ENUM('nhà lãnh đạo cơ quan', 'Công nhân')`);
        await queryRunner.query(`CREATE TABLE "report_detail_accident" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nguyen_nhan_tai_nan" "public"."nguyen_nhan_tai_nan_enum" NOT NULL, "yeu_to_chan_thuong" "public"."yeu_to_chan_thuong_enum" NOT NULL, "nghe_nghiep" "public"."nghe_nghiep_enum" NOT NULL, "total_human_injured" integer NOT NULL DEFAULT '0', "total_female_injured" integer NOT NULL DEFAULT '0', "total_human_death" integer NOT NULL DEFAULT '0', "total_human_injured_heavy" integer NOT NULL DEFAULT '0', "total_human_injured_no_ql" integer NOT NULL DEFAULT '0', "total_female_injured_no_ql" integer NOT NULL DEFAULT '0', "total_human_death_no_ql" integer NOT NULL DEFAULT '0', "total_human_injured_heavy_no_ql" integer NOT NULL DEFAULT '0', "budget_medical" numeric(15,2) NOT NULL DEFAULT '0', "budget_salary" numeric(15,2) NOT NULL DEFAULT '0', "budget_help" numeric(15,2) NOT NULL DEFAULT '0', "total_budget" numeric(15,2) NOT NULL DEFAULT '0', "total_day_off" integer NOT NULL DEFAULT '0', "total_thiet_hai" numeric(15,2) NOT NULL DEFAULT '0', "id_report" uuid NOT NULL, CONSTRAINT "PK_3a17d9d0617deabf482bcef7d5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."report_status_enum" AS ENUM('reporting', 'received')`);
        await queryRunner.query(`CREATE TABLE "report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "period" "public"."report_period_enum" NOT NULL, "status" "public"."report_status_enum" NOT NULL DEFAULT 'reporting', "year" smallint NOT NULL, "total_employees" integer NOT NULL DEFAULT '0', "total_female_employees" integer NOT NULL DEFAULT '0', "total_quy_luong" numeric(15,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id_business" uuid NOT NULL, "report_config_id" uuid NOT NULL, CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "is_active" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'DOANH_NGHIEP', 'MANAGER', 'EMPLOYEE')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'DOANH_NGHIEP'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_e36788e108a35bef8228c8524d" ON "business_industries" ("level") `);
        await queryRunner.query(`CREATE INDEX "IDX_6d24946494eb98ff7d1da33a96" ON "business_industries" ("parent_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9ccbc0abaf5213d511bf751270" ON "businesses" ("tax_code") `);
        await queryRunner.query(`ALTER TABLE "business_industries" ADD CONSTRAINT "FK_6d24946494eb98ff7d1da33a967" FOREIGN KEY ("parent_id") REFERENCES "business_industries"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report_accident" ADD CONSTRAINT "fk_report_accident_report" FOREIGN KEY ("id_report") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report_detail_accident" ADD CONSTRAINT "fk_report_detail_accident_report" FOREIGN KEY ("id_report") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "fk_report_business" FOREIGN KEY ("id_business") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "fk_report_report_config" FOREIGN KEY ("report_config_id") REFERENCES "report_config"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "FK_73094057b7c5ab456deb2b75d77" FOREIGN KEY ("business_type_id") REFERENCES "business_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "FK_45059d295de3313ddd17603e035" FOREIGN KEY ("business_industry_id") REFERENCES "business_industries"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_cde4b2aabca86cfabdc78b537f0" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_cde4b2aabca86cfabdc78b537f0"`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP CONSTRAINT "FK_45059d295de3313ddd17603e035"`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP CONSTRAINT "FK_73094057b7c5ab456deb2b75d77"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "fk_report_report_config"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "fk_report_business"`);
        await queryRunner.query(`ALTER TABLE "report_detail_accident" DROP CONSTRAINT "fk_report_detail_accident_report"`);
        await queryRunner.query(`ALTER TABLE "report_accident" DROP CONSTRAINT "fk_report_accident_report"`);
        await queryRunner.query(`ALTER TABLE "business_industries" DROP CONSTRAINT "FK_6d24946494eb98ff7d1da33a967"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9ccbc0abaf5213d511bf751270"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6d24946494eb98ff7d1da33a96"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e36788e108a35bef8228c8524d"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('ADMIN', 'DOANH_NGHIEP', 'MANAGER', 'EMPLOYEE')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'DOANH_NGHIEP'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "is_active" DROP NOT NULL`);
        await queryRunner.query(`DROP TABLE "report"`);
        await queryRunner.query(`DROP TYPE "public"."report_status_enum"`);
        await queryRunner.query(`DROP TABLE "report_detail_accident"`);
        await queryRunner.query(`DROP TYPE "public"."nghe_nghiep_enum"`);
        await queryRunner.query(`DROP TYPE "public"."yeu_to_chan_thuong_enum"`);
        await queryRunner.query(`DROP TYPE "public"."nguyen_nhan_tai_nan_enum"`);
        await queryRunner.query(`DROP TABLE "report_accident"`);
        await queryRunner.query(`DROP TYPE "public"."report_type_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_businesses_business_industry_id" ON "businesses" ("business_industry_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_businesses_business_type_id" ON "businesses" ("business_type_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_business_industries_level" ON "business_industries" ("level") `);
        await queryRunner.query(`CREATE INDEX "IDX_business_industries_parent_id" ON "business_industries" ("parent_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_business_types_code" ON "business_types" ("code") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "users_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "FK_businesses_business_industry_id" FOREIGN KEY ("business_industry_id") REFERENCES "business_industries"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "FK_businesses_business_type_id" FOREIGN KEY ("business_type_id") REFERENCES "business_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "business_industries" ADD CONSTRAINT "FK_business_industries_parent_id" FOREIGN KEY ("parent_id") REFERENCES "business_industries"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
