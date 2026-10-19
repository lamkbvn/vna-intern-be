import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/user.entity.js';
import { BusinessIndustry } from '../modules/business-industries/entities/business-industry.entity.js';
import { BusinessType } from '../modules/business-types/entities/business-type.entity.js';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  // Các entity của hệ thống
  entities: [User, BusinessIndustry, BusinessType],
  migrations: ['src/migrations/*.ts'],

  synchronize: false,
});
