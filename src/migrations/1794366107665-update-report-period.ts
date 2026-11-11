import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateReportPeriod1794366107665 implements MigrationInterface {
    name = 'UpdateReportPeriod1794366107665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "report_accident" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."report_type_enum" NOT NULL, "total_accident" integer NOT NULL DEFAULT '0', "total_accident_death" integer NOT NULL DEFAULT '0', "total_human_injured_more_2" integer NOT NULL DEFAULT '0', "total_human_injured" integer NOT NULL DEFAULT '0', "total_female_injured" integer NOT NULL DEFAULT '0', "total_human_death" integer NOT NULL DEFAULT '0', "total_human_injured_heavy" integer NOT NULL DEFAULT '0', "total_human_injured_no_ql" integer NOT NULL DEFAULT '0', "total_female_injured_no_ql" integer NOT NULL DEFAULT '0', "total_human_death_no_ql" integer NOT NULL DEFAULT '0', "total_human_injured_heavy_no_ql" integer NOT NULL DEFAULT '0', "budget_medical" numeric(24,2) NOT NULL DEFAULT '0', "budget_salary" numeric(24,2) NOT NULL DEFAULT '0', "budget_help" numeric(24,2) NOT NULL DEFAULT '0', "total_budget" numeric(24,2) NOT NULL DEFAULT '0', "total_day_off" integer NOT NULL DEFAULT '0', "total_thiet_hai" numeric(24,2) NOT NULL DEFAULT '0', "id_report" uuid NOT NULL, CONSTRAINT "PK_bf83ae883ae03ff9f0273c9b328" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "report_detail_accident" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nguyen_nhan_tai_nan" "public"."nguyen_nhan_tai_nan_enum" NOT NULL, "yeu_to_chan_thuong" character varying(255), "nghe_nghiep" character varying(255), "total_human_injured" integer NOT NULL DEFAULT '0', "total_female_injured" integer NOT NULL DEFAULT '0', "total_human_death" integer NOT NULL DEFAULT '0', "total_human_injured_heavy" integer NOT NULL DEFAULT '0', "total_human_injured_no_ql" integer NOT NULL DEFAULT '0', "total_female_injured_no_ql" integer NOT NULL DEFAULT '0', "total_human_death_no_ql" integer NOT NULL DEFAULT '0', "total_human_injured_heavy_no_ql" integer NOT NULL DEFAULT '0', "budget_medical" numeric(24,2) NOT NULL DEFAULT '0', "budget_salary" numeric(24,2) NOT NULL DEFAULT '0', "budget_help" numeric(24,2) NOT NULL DEFAULT '0', "total_budget" numeric(24,2) NOT NULL DEFAULT '0', "total_day_off" integer NOT NULL DEFAULT '0', "total_thiet_hai" numeric(24,2) NOT NULL DEFAULT '0', "id_report" uuid NOT NULL, CONSTRAINT "PK_3a17d9d0617deabf482bcef7d5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "report_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "year" smallint NOT NULL, "period" "public"."report_period_enum" NOT NULL, "name" character varying(255) NOT NULL, "date_start" date NOT NULL, "date_end" date NOT NULL, "status" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7a1ae7346a9f531cbacb52a0a07" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_report_config_year_period" ON "report_config" ("year", "period") `);
        await queryRunner.query(`CREATE TABLE "report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "period" "public"."report_period_enum" NOT NULL, "status" "public"."report_status_enum" NOT NULL DEFAULT 'reporting', "year" smallint NOT NULL, "total_employees" integer NOT NULL DEFAULT '0', "total_female_employees" integer NOT NULL DEFAULT '0', "total_quy_luong" numeric(24,2) NOT NULL DEFAULT '0', "attachment_url" character varying(500), "attachment_name" character varying(255), "note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id_business" uuid NOT NULL, "report_config_id" uuid NOT NULL, CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "report_accident" ADD CONSTRAINT "fk_report_accident_report" FOREIGN KEY ("id_report") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report_detail_accident" ADD CONSTRAINT "fk_report_detail_accident_report" FOREIGN KEY ("id_report") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "fk_report_business" FOREIGN KEY ("id_business") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "fk_report_report_config" FOREIGN KEY ("report_config_id") REFERENCES "report_config"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "fk_report_report_config"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "fk_report_business"`);
        await queryRunner.query(`ALTER TABLE "report_detail_accident" DROP CONSTRAINT "fk_report_detail_accident_report"`);
        await queryRunner.query(`ALTER TABLE "report_accident" DROP CONSTRAINT "fk_report_accident_report"`);
        await queryRunner.query(`DROP TABLE "report"`);
        await queryRunner.query(`DROP INDEX "public"."uq_report_config_year_period"`);
        await queryRunner.query(`DROP TABLE "report_config"`);
        await queryRunner.query(`DROP TABLE "report_detail_accident"`);
        await queryRunner.query(`DROP TABLE "report_accident"`);
    }

}
