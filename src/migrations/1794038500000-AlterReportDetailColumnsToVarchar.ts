import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterReportDetailColumnsToVarchar1794038500000 implements MigrationInterface {
    name = 'AlterReportDetailColumnsToVarchar1794038500000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_detail_accident" ALTER COLUMN "yeu_to_chan_thuong" TYPE character varying(255) USING "yeu_to_chan_thuong"::character varying(255)`);
        await queryRunner.query(`ALTER TABLE "report_detail_accident" ALTER COLUMN "nghe_nghiep" TYPE character varying(255) USING "nghe_nghiep"::character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_detail_accident" ALTER COLUMN "yeu_to_chan_thuong" TYPE "public"."yeu_to_chan_thuong_enum" USING "yeu_to_chan_thuong"::"public"."yeu_to_chan_thuong_enum"`);
        await queryRunner.query(`ALTER TABLE "report_detail_accident" ALTER COLUMN "nghe_nghiep" TYPE "public"."nghe_nghiep_enum" USING "nghe_nghiep"::"public"."nghe_nghiep_enum"`);
    }
}
