import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBusinessesTable1791880000002 implements MigrationInterface {
  name = 'CreateBusinessesTable1791880000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "businesses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "tax_code" character varying(10) NOT NULL,
        "address" text,
        "registered_district" character varying(100),
        "registered_province" character varying(100),
        "license_date" date,
        "foreign_name" character varying(255),
        "email" character varying(255) NOT NULL,
        "office_phone" character varying(50),
        "operating_province" character varying(100),
        "operating_district" character varying(100),
        "business_location" text,
        "representative_name" character varying(100),
        "representative_phone" character varying(50),
        "business_type_id" uuid NOT NULL,
        "business_industry_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_businesses_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_businesses_tax_code" UNIQUE ("tax_code"),
        CONSTRAINT "FK_businesses_business_type_id" FOREIGN KEY ("business_type_id") 
          REFERENCES "business_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_businesses_business_industry_id" FOREIGN KEY ("business_industry_id") 
          REFERENCES "business_industries"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_businesses_business_type_id" ON "businesses" ("business_type_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_businesses_business_industry_id" ON "businesses" ("business_industry_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_businesses_business_industry_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_businesses_business_type_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "businesses"`);
  }
}
