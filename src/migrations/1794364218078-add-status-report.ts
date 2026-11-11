import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusReport1794364218078
  implements MigrationInterface
{
  name = 'AddStatusReport1794364218078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."report_status_enum"
      RENAME TO "report_status_enum_old"
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."report_status_enum"
      AS ENUM (
        'not_reporting',
        'reporting',
        'received',
        'approved',
        'rejected',
        'expired'
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "report"
      ALTER COLUMN "status" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "report"
      ALTER COLUMN "status"
      TYPE "public"."report_status_enum"
      USING "status"::text::"public"."report_status_enum"
    `);

    await queryRunner.query(`
      ALTER TABLE "report"
      ALTER COLUMN "status"
      SET DEFAULT 'reporting'
    `);

    await queryRunner.query(`
      DROP TYPE "public"."report_status_enum_old"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra dữ liệu trước khi rollback
    await queryRunner.query(`
      UPDATE "report"
      SET "status" = 'reporting'
      WHERE "status" IN (
        'not_reporting',
        'approved',
        'rejected',
        'expired'
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "report"
      ALTER COLUMN "status" DROP DEFAULT
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."report_status_enum_old"
      AS ENUM ('reporting', 'received')
    `);

    await queryRunner.query(`
      ALTER TABLE "report"
      ALTER COLUMN "status"
      TYPE "public"."report_status_enum_old"
      USING "status"::text::"public"."report_status_enum_old"
    `);

    await queryRunner.query(`
      ALTER TABLE "report"
      ALTER COLUMN "status"
      SET DEFAULT 'reporting'
    `);

    await queryRunner.query(`
      DROP TYPE "public"."report_status_enum"
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."report_status_enum_old"
      RENAME TO "report_status_enum"
    `);
  }
}