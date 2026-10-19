import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BusinessController } from './business.controller.js';
import { BusinessService } from './business.service.js';
import { Business } from './entities/business.entity.js';
import { BusinessType } from '../business-types/entities/business-type.entity.js';
import { BusinessIndustry } from '../business-industries/entities/business-industry.entity.js';

describe('BusinessController', () => {
  let controller: BusinessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessController],
      providers: [
        BusinessService,
        {
          provide: getRepositoryToken(Business),
          useValue: {
            find: () => Promise.resolve([]),
            findOne: () => Promise.resolve(null),
          },
        },
        {
          provide: getRepositoryToken(BusinessType),
          useValue: {
            findOne: () => Promise.resolve(null),
          },
        },
        {
          provide: getRepositoryToken(BusinessIndustry),
          useValue: {
            findOne: () => Promise.resolve(null),
          },
        },
      ],
    }).compile();

    controller = module.get<BusinessController>(BusinessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
