import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessTypesService } from './business-types.service.js';
import { BusinessTypesController } from './business-types.controller.js';
import { BusinessType } from './entities/business-type.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessType])],
  controllers: [BusinessTypesController],
  providers: [BusinessTypesService],
  exports: [BusinessTypesService, TypeOrmModule],
})
export class BusinessTypesModule {}
