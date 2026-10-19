import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BusinessIndustriesService } from './business-industries.service.js';
import { BusinessIndustry } from './entities/business-industry.entity.js';

describe('BusinessIndustriesService', () => {
  let service: BusinessIndustriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessIndustriesService,
        {
          provide: getRepositoryToken(BusinessIndustry),
          useValue: {
            find: () => Promise.resolve([]),
            findOne: () => Promise.resolve(null),
            save: (entity: any) => Promise.resolve(entity),
            create: (dto: any) => dto,
            remove: (entity: any) => Promise.resolve(entity),
            count: () => Promise.resolve(0),
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
              addOrderBy: function () {
                return this;
              },
              skip: function () {
                return this;
              },
              take: function () {
                return this;
              },
              getMany: () => Promise.resolve([]),
              getManyAndCount: () => Promise.resolve([[], 0]),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BusinessIndustriesService>(BusinessIndustriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
