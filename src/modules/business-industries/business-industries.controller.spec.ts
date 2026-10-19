import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BusinessIndustriesController } from './business-industries.controller.js';
import { BusinessIndustriesService } from './business-industries.service.js';
import { BusinessIndustry } from './entities/business-industry.entity.js';

describe('BusinessIndustriesController', () => {
  let controller: BusinessIndustriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessIndustriesController],
      providers: [
        BusinessIndustriesService,
        {
          provide: getRepositoryToken(BusinessIndustry),
          useValue: {
            find: () => Promise.resolve([]),
            findOne: () => Promise.resolve(null),
          },
        },
      ],
    }).compile();

    controller = module.get<BusinessIndustriesController>(
      BusinessIndustriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
