import { MigrationInterface, QueryRunner } from "typeorm";

export class Report1793583637698 implements MigrationInterface {
    name = 'Report1793583637698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "report_accident" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."report_type_enum" NOT NULL, "total_accident" integer NOT NULL DEFAULT '0', "total_accident_death" integer NOT NULL DEFAULT '0', "total_human_injured_more_2" integer NOT NULL DEFAULT '0', "total_human_injured" integer NOT NULL DEFAULT '0', "total_female_injured" integer NOT NULL DEFAULT '0', "total_human_death" integer NOT NULL DEFAULT '0', "total_human_injured_heavy" integer NOT NULL DEFAULT '0', "total_human_injured_no_ql" integer NOT NULL DEFAULT '0', "total_female_injured_no_ql" integer NOT NULL DEFAULT '0', "total_human_death_no_ql" integer NOT NULL DEFAULT '0', "total_human_injured_heavy_no_ql" integer NOT NULL DEFAULT '0', "budget_medical" numeric(15,2) NOT NULL DEFAULT '0', "budget_salary" numeric(15,2) NOT NULL DEFAULT '0', "budget_help" numeric(15,2) NOT NULL DEFAULT '0', "total_budget" numeric(15,2) NOT NULL DEFAULT '0', "total_day_off" integer NOT NULL DEFAULT '0', "total_thiet_hai" numeric(15,2) NOT NULL DEFAULT '0', "id_report" uuid NOT NULL, CONSTRAINT "PK_bf83ae883ae03ff9f0273c9b328" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "report_detail_accident" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nguyen_nhan_tai_nan" "public"."nguyen_nhan_tai_nan_enum" NOT NULL, "yeu_to_chan_thuong" "public"."yeu_to_chan_thuong_enum" NOT NULL, "nghe_nghiep" "public"."nghe_nghiep_enum" NOT NULL, "total_human_injured" integer NOT NULL DEFAULT '0', "total_female_injured" integer NOT NULL DEFAULT '0', "total_human_death" integer NOT NULL DEFAULT '0', "total_human_injured_heavy" integer NOT NULL DEFAULT '0', "total_human_injured_no_ql" integer NOT NULL DEFAULT '0', "total_female_injured_no_ql" integer NOT NULL DEFAULT '0', "total_human_death_no_ql" integer NOT NULL DEFAULT '0', "total_human_injured_heavy_no_ql" integer NOT NULL DEFAULT '0', "budget_medical" numeric(15,2) NOT NULL DEFAULT '0', "budget_salary" numeric(15,2) NOT NULL DEFAULT '0', "budget_help" numeric(15,2) NOT NULL DEFAULT '0', "total_budget" numeric(15,2) NOT NULL DEFAULT '0', "total_day_off" integer NOT NULL DEFAULT '0', "total_thiet_hai" numeric(15,2) NOT NULL DEFAULT '0', "id_report" uuid NOT NULL, CONSTRAINT "PK_3a17d9d0617deabf482bcef7d5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "period" "public"."report_period_enum" NOT NULL, "status" "public"."report_status_enum" NOT NULL DEFAULT 'reporting', "year" smallint NOT NULL, "total_employees" integer NOT NULL DEFAULT '0', "total_female_employees" integer NOT NULL DEFAULT '0', "total_quy_luong" numeric(15,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id_business" uuid NOT NULL, CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "report_accident" ADD CONSTRAINT "fk_report_accident_report" FOREIGN KEY ("id_report") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report_detail_accident" ADD CONSTRAINT "fk_report_detail_accident_report" FOREIGN KEY ("id_report") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "fk_report_business" FOREIGN KEY ("id_business") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "fk_report_business"`);
        await queryRunner.query(`ALTER TABLE "report_detail_accident" DROP CONSTRAINT "fk_report_detail_accident_report"`);
        await queryRunner.query(`ALTER TABLE "report_accident" DROP CONSTRAINT "fk_report_accident_report"`);
        await queryRunner.query(`DROP TABLE "report"`);
        await queryRunner.query(`DROP TABLE "report_detail_accident"`);
        await queryRunner.query(`DROP TABLE "report_accident"`);
    }

}
