import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBusinessIndustriesTable1791880000000
  implements MigrationInterface
{
  name = 'CreateBusinessIndustriesTable1791880000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "business_industries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(50) NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "level" smallint NOT NULL,
        "parent_id" uuid,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_business_industries_code" UNIQUE ("code"),
        CONSTRAINT "PK_business_industries_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_business_industries_parent_id" FOREIGN KEY ("parent_id") 
          REFERENCES "business_industries"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_business_industries_parent_id" ON "business_industries" ("parent_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_business_industries_level" ON "business_industries" ("level")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_business_industries_level"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_business_industries_parent_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "business_industries"`);
  }
}
