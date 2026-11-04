import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelationReportReportConfig1793762632742
  implements MigrationInterface
{
  name = 'RelationReportReportConfig1793762632742';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Thêm cột report_config_id, cho phép NULL tạm thời
    await queryRunner.query(`
      ALTER TABLE "report"
      ADD COLUMN "report_config_id" uuid
    `);

    // 2. Gán ID ReportConfig cho toàn bộ Report hiện tại
    await queryRunner.query(`
      UPDATE "report"
      SET "report_config_id" = '875a51de-7660-4011-a40a-92ee2dc32aae'
      WHERE "report_config_id" IS NULL
    `);

    // 3. Chuyển cột thành NOT NULL
    await queryRunner.query(`
      ALTER TABLE "report"
      ALTER COLUMN "report_config_id" SET NOT NULL
    `);

    // 4. Tạo khóa ngoại
    await queryRunner.query(`
      ALTER TABLE "report"
      ADD CONSTRAINT "fk_report_report_config"
      FOREIGN KEY ("report_config_id")
      REFERENCES "report_config"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "report"
      DROP CONSTRAINT "fk_report_report_config"
    `);

    await queryRunner.query(`
      ALTER TABLE "report"
      DROP COLUMN "report_config_id"
    `);
  }
}