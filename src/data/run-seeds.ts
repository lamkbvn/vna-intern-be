import 'reflect-metadata';
import 'dotenv/config';
import AppDataSource from './data-source.js';
import { seedUsers } from './seeds/user.seed.js';
import { seedBusinessIndustries } from './seeds/business-industry.seed.js';
import { seedBusinessTypes } from './seeds/business-type.seed.js';

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('🚀 Database connected for seeding...');

    // Chạy theo đúng thứ tự phụ thuộc
    await seedUsers(AppDataSource);
    await seedBusinessIndustries(AppDataSource);
    await seedBusinessTypes(AppDataSource);

    console.log('🎉 All seeders executed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void runSeed();