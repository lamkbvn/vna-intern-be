import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BusinessService } from './business.service.js';
import { Business } from './entities/business.entity.js';
import { BusinessType } from '../business-types/entities/business-type.entity.js';
import { BusinessIndustry } from '../business-industries/entities/business-industry.entity.js';

describe('BusinessService', () => {
  let service: BusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: getRepositoryToken(Business),
          useValue: {
            find: () => Promise.resolve([]),
            findOne: () => Promise.resolve(null),
            save: (entity: any) => Promise.resolve(entity),
            create: (dto: any) => dto,
            remove: (entity: any) => Promise.resolve(entity),
            createQueryBuilder: () => ({
              leftJoinAndSelect: function () {
                return this;
              },
              where: function () {
                return this;
              },
              andWhere: function () {
                return this;
              },
              orderBy: function () {
                return this;
              },
              skip: function () {
                return this;
              },
              take: function () {
                return this;
              },
              getManyAndCount: () => Promise.resolve([[], 0]),
            }),
          },
        },
        {
          provide: getRepositoryToken(BusinessType),
          useValue: {
            findOne: () => Promise.resolve({ id: 'uuid-type-1' }),
          },
        },
        {
          provide: getRepositoryToken(BusinessIndustry),
          useValue: {
            findOne: () => Promise.resolve({ id: 'uuid-industry-1' }),
          },
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
