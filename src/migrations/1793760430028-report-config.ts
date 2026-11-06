import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReportConfig1793760430028 implements MigrationInterface {
  name = 'ReportConfig1793760430028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_period_enum') THEN
          CREATE TYPE "public"."report_period_enum" AS ENUM('6 months', '12 months');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE "report_config" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "year" smallint NOT NULL,
        "period" "public"."report_period_enum" NOT NULL,
        "name" character varying(255) NOT NULL,
        "date_start" date NOT NULL,
        "date_end" date NOT NULL,
        "status" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_7a1ae7346a9f531cbacb52a0a07"
          PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_report_config_year_period"
      ON "report_config" ("year", "period")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "public"."uq_report_config_year_period"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "report_config"
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."report_period_enum"
    `);
  }
}